import { useCallback, useEffect, useMemo, useState } from "react";
import {
    awardAdminLoyaltyPoints,
    awardTrainerStudentLoyaltyPoints,
    correctAdminLoyaltyPoints,
    getAdminMemberLoyaltyHistory,
    getTrainerStudentLoyaltyHistory,
    revokeAdminLoyaltyPoints,
    type LoyaltyPointHistoryItem,
    type ManualPointAwardRequest,
    type PointCorrectionRequest,
    type PointRevokeRequest,
} from "../../../shared/api/loyalty.api";
import {
    addStudent,
    getMemberDetails,
    getStudentHistory,
    removeAdminTrainerStudentLink,
    removeStudent,
    updateStudentCoachNote,
    updateStudentRemainingTrainings,
} from "../api/members.api";
import { MEMBER_DETAILS_TEXT } from "./members.constants";
import { toNumericDraft } from "./members.helpers";
import type { MemberDetails, MemberListItem, TrainerStudentHistory } from "./members.types";
import { useMemberRoleFlags } from "./useMemberRoleFlags";

type Params = {
    open: boolean
    member: MemberListItem | null
    onStudentChanged?: () => void
    onAdminStudentRemoved?: () => void
}

type RemoveMode = "coach" | "admin";
export type MemberDetailsTab = "OVERVIEW" | "HISTORY" | "POTENTIAL" | "LOYALTY";

function buildPreviewMember(member: MemberListItem, details: MemberDetails | null): MemberListItem {
    if (!details) {
        return member;
    }

    return {
        id: details.id,
        nickname: details.nickname,
        phone: details.phone,
        phoneHidden: details.phoneHidden,
        avatarUrl: details.avatarUrl,
        points: details.points,
        statusLabel: details.statusLabel,
        roleCode: details.roleCode,
        remainingTrainings: details.remainingTrainings,
        trainerStudentLinkId: member.trainerStudentLinkId,
        trainerId: member.trainerId,
        trainerName: member.trainerName,
    };
}

function canTargetStudentRole(details: MemberDetails | null): boolean {
    return details != null && details.roleCode !== "COACH" && details.roleCode !== "ADMIN";
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
        return error.message;
    }

    return fallback;
}

export function useMemberDetailsModal({ open, member, onStudentChanged, onAdminStudentRemoved }: Params) {
    const [activeTab, setActiveTab] = useState<MemberDetailsTab>("OVERVIEW");
    const { isAdmin, isCoach } = useMemberRoleFlags();
    const [details, setDetails] = useState<MemberDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [balanceDraft, setBalanceDraft] = useState("0");
    const [savingBalance, setSavingBalance] = useState(false);
    const [noteDraft, setNoteDraft] = useState("");
    const [editingNote, setEditingNote] = useState(false);
    const [savingNote, setSavingNote] = useState(false);
    const [history, setHistory] = useState<TrainerStudentHistory | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyPointHistoryItem[]>([]);
    const [loyaltyLoading, setLoyaltyLoading] = useState(false);
    const [loyaltySaving, setLoyaltySaving] = useState(false);
    const [loyaltyError, setLoyaltyError] = useState<string | null>(null);
    const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
    const [removingStudent, setRemovingStudent] = useState(false);

    const preview = useMemo(() => {
        if (!member) {
            return null;
        }

        return buildPreviewMember(member, details);
    }, [details, member]);

    const adminLinkId = member?.trainerStudentLinkId ?? null;
    const canRemoveAdminStudent = isAdmin && Boolean(adminLinkId) && canTargetStudentRole(details);
    const canManageCoachStudent = isCoach && canTargetStudentRole(details);
    const canManageStudent = canManageCoachStudent || canRemoveAdminStudent;
    const canManageLoyalty = Boolean(details && canTargetStudentRole(details) && (isAdmin || (isCoach && details.myStudent)));
    const studentActionIsStudent = Boolean(details?.myStudent || canRemoveAdminStudent);
    const removeMode: RemoveMode | null = canRemoveAdminStudent ? "admin" : details?.myStudent ? "coach" : null;
    const removeConfirmationBody = canRemoveAdminStudent
        ? `${MEMBER_DETAILS_TEXT.removeStudentAdminConfirmBody} ${member?.trainerName ?? "тренера"}.`
        : MEMBER_DETAILS_TEXT.removeStudentCoachConfirmBody;

    const loadDetails = useCallback(async (preserveCurrent: boolean) => {
        if (!member) {
            return;
        }

        if (preserveCurrent) {
            setRefreshing(true);
        } else {
            setLoading(true);
            setDetails(null);
        }
        setError(null);

        try {
            const nextDetails = await getMemberDetails(member.id);
            setDetails(nextDetails);
        } catch (nextError) {
            setError(getErrorMessage(nextError, MEMBER_DETAILS_TEXT.loadError));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [member]);

    useEffect(() => {
        if (!open) {
            document.body.style.overflow = "auto";
            setEditingNote(false);
            setRemoveConfirmOpen(false);
            setRemovingStudent(false);
            return;
        }

        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);

    useEffect(() => {
        if (!open || !member) {
            setDetails(null);
            setError(null);
            setLoading(false);
            setRefreshing(false);
            setActiveTab("OVERVIEW");
            setHistory(null);
            setHistoryLoading(false);
            setHistoryError(null);
            setLoyaltyHistory([]);
            setLoyaltyLoading(false);
            setLoyaltySaving(false);
            setLoyaltyError(null);
            setBalanceDraft("0");
            setNoteDraft("");
            setEditingNote(false);
            setRemoveConfirmOpen(false);
            setRemovingStudent(false);
            return;
        }

        setRemoveConfirmOpen(false);
        setRemovingStudent(false);
        void loadDetails(false);
    }, [loadDetails, member, open]);

    useEffect(() => {
        setBalanceDraft(toNumericDraft(details?.remainingTrainings));
    }, [details?.remainingTrainings]);

    useEffect(() => {
        setNoteDraft(details?.trainerStudentCard?.trainerNote?.note ?? "");
    }, [details?.trainerStudentCard?.trainerNote?.note]);

    const loadHistory = useCallback(async () => {
        if (!member) {
            return;
        }

        try {
            setHistoryLoading(true);
            setHistoryError(null);
            const nextHistory = await getStudentHistory(member.id);
            setHistory(nextHistory);
        } catch (nextError) {
            setHistoryError(getErrorMessage(nextError, "Не удалось загрузить историю ученика"));
        } finally {
            setHistoryLoading(false);
        }
    }, [member]);

    useEffect(() => {
        if (activeTab !== "HISTORY" || !details?.myStudent || history || historyLoading) {
            return;
        }

        void loadHistory();
    }, [activeTab, details?.myStudent, history, historyLoading, loadHistory]);

    const loadLoyaltyHistory = useCallback(async () => {
        if (!details || !canManageLoyalty) {
            return;
        }

        try {
            setLoyaltyLoading(true);
            setLoyaltyError(null);
            const nextHistory = isAdmin
                ? await getAdminMemberLoyaltyHistory(details.id, 20)
                : await getTrainerStudentLoyaltyHistory(details.id, 20);
            setLoyaltyHistory(nextHistory);
        } catch (nextError) {
            setLoyaltyError(getErrorMessage(nextError, "Не удалось загрузить историю баллов"));
        } finally {
            setLoyaltyLoading(false);
        }
    }, [canManageLoyalty, details, isAdmin]);

    useEffect(() => {
        if (activeTab !== "LOYALTY" || !canManageLoyalty || loyaltyLoading || loyaltyHistory.length > 0) {
            return;
        }

        void loadLoyaltyHistory();
    }, [activeTab, canManageLoyalty, loadLoyaltyHistory, loyaltyHistory.length, loyaltyLoading]);

    const handleAddStudent = useCallback(async () => {
        if (!details) {
            return;
        }

        try {
            setError(null);
            await addStudent(details.id);
            onStudentChanged?.();
            setHistory(null);
            await loadDetails(true);
        } catch (nextError) {
            setError(getErrorMessage(nextError, MEMBER_DETAILS_TEXT.addStudentError));
        }
    }, [details, loadDetails, onStudentChanged]);

    const handleRequestRemoveStudent = useCallback(() => {
        if (!removeMode) {
            return;
        }

        setRemoveConfirmOpen(true);
    }, [removeMode]);

    const handleCancelRemoveStudent = useCallback(() => {
        if (removingStudent) {
            return;
        }

        setRemoveConfirmOpen(false);
    }, [removingStudent]);

    const handleConfirmRemoveStudent = useCallback(async () => {
        if (!details || !removeMode) {
            return;
        }

        try {
            setRemovingStudent(true);
            setError(null);

            if (removeMode === "admin") {
                if (!adminLinkId) {
                    throw new Error(MEMBER_DETAILS_TEXT.removeStudentError);
                }

                await removeAdminTrainerStudentLink(adminLinkId);
                setRemoveConfirmOpen(false);
                onStudentChanged?.();
                onAdminStudentRemoved?.();
                return;
            }

            await removeStudent(details.id);
            setEditingNote(false);
            setRemoveConfirmOpen(false);
            setHistory(null);
            onStudentChanged?.();
            await loadDetails(true);
        } catch (nextError) {
            setError(getErrorMessage(nextError, MEMBER_DETAILS_TEXT.removeStudentError));
        } finally {
            setRemovingStudent(false);
        }
    }, [adminLinkId, details, loadDetails, onAdminStudentRemoved, onStudentChanged, removeMode]);

    const handleBalanceDraftChange = useCallback((value: string) => {
        if (/^\d*$/.test(value)) {
            setBalanceDraft(value);
        }
    }, []);

    const handleBalanceAdjust = useCallback((delta: number) => {
        const current = Number.parseInt(balanceDraft || "0", 10);
        const next = Math.max(0, (Number.isNaN(current) ? 0 : current) + delta);
        setBalanceDraft(String(next));
    }, [balanceDraft]);

    const handleBalanceSubmit = useCallback(async () => {
        if (!details?.myStudent) {
            return;
        }

        const parsed = Number.parseInt(balanceDraft || "0", 10);
        const nextBalance = Number.isNaN(parsed) ? 0 : parsed;

        try {
            setSavingBalance(true);
            setError(null);
            await updateStudentRemainingTrainings(details.id, nextBalance);
            setHistory(null);
            onStudentChanged?.();
            await loadDetails(true);
        } catch (nextError) {
            setError(getErrorMessage(nextError, MEMBER_DETAILS_TEXT.updateBalanceError));
        } finally {
            setSavingBalance(false);
        }
    }, [balanceDraft, details, loadDetails, onStudentChanged]);

    const handleStartNoteEdit = useCallback(() => {
        setNoteDraft(details?.trainerStudentCard?.trainerNote?.note ?? "");
        setEditingNote(true);
    }, [details?.trainerStudentCard?.trainerNote?.note]);

    const handleCancelNoteEdit = useCallback(() => {
        setNoteDraft(details?.trainerStudentCard?.trainerNote?.note ?? "");
        setEditingNote(false);
    }, [details?.trainerStudentCard?.trainerNote?.note]);

    const handleSaveNote = useCallback(async () => {
        if (!details?.myStudent) {
            return;
        }

        try {
            setSavingNote(true);
            setError(null);
            await updateStudentCoachNote(details.id, noteDraft);
            setEditingNote(false);
            await loadDetails(true);
        } catch (nextError) {
            setError(getErrorMessage(nextError, MEMBER_DETAILS_TEXT.updateNoteError));
        } finally {
            setSavingNote(false);
        }
    }, [details, loadDetails, noteDraft]);

    const handleAwardLoyalty = useCallback(async (request: ManualPointAwardRequest) => {
        if (!details || !canManageLoyalty) {
            return;
        }

        try {
            setLoyaltySaving(true);
            setLoyaltyError(null);
            if (isAdmin) {
                await awardAdminLoyaltyPoints(request);
            } else {
                await awardTrainerStudentLoyaltyPoints(details.id, request);
            }
            await Promise.all([
                loadLoyaltyHistory(),
                loadDetails(true),
            ]);
            onStudentChanged?.();
        } catch (nextError) {
            setLoyaltyError(getErrorMessage(nextError, "Не удалось сохранить начисление"));
        } finally {
            setLoyaltySaving(false);
        }
    }, [canManageLoyalty, details, isAdmin, loadDetails, loadLoyaltyHistory, onStudentChanged]);

    const handleCorrectLoyalty = useCallback(async (entryId: string, request: PointCorrectionRequest) => {
        if (!isAdmin) {
            return;
        }

        try {
            setLoyaltySaving(true);
            setLoyaltyError(null);
            await correctAdminLoyaltyPoints(entryId, request);
            await Promise.all([
                loadLoyaltyHistory(),
                loadDetails(true),
            ]);
            onStudentChanged?.();
        } catch (nextError) {
            setLoyaltyError(getErrorMessage(nextError, "Не удалось сохранить коррекцию"));
        } finally {
            setLoyaltySaving(false);
        }
    }, [isAdmin, loadDetails, loadLoyaltyHistory, onStudentChanged]);

    const handleRevokeLoyalty = useCallback(async (entryId: string, request: PointRevokeRequest) => {
        if (!isAdmin) {
            return;
        }

        try {
            setLoyaltySaving(true);
            setLoyaltyError(null);
            await revokeAdminLoyaltyPoints(entryId, request);
            await Promise.all([
                loadLoyaltyHistory(),
                loadDetails(true),
            ]);
            onStudentChanged?.();
        } catch (nextError) {
            setLoyaltyError(getErrorMessage(nextError, "Не удалось отозвать запись"));
        } finally {
            setLoyaltySaving(false);
        }
    }, [isAdmin, loadDetails, loadLoyaltyHistory, onStudentChanged]);

    return {
        preview,
        activeTab,
        setActiveTab,
        details,
        loading,
        refreshing,
        error,
        canManageStudent,
        balanceDraft,
        savingBalance,
        noteDraft,
        editingNote,
        savingNote,
        history,
        historyLoading,
        historyError,
        loyaltyHistory,
        loyaltyLoading,
        loyaltySaving,
        loyaltyError,
        studentActionIsStudent,
        canManageLoyalty,
        loyaltyIsAdmin: isAdmin,
        removeConfirmOpen,
        removeConfirmationBody,
        removingStudent,
        setNoteDraft,
        handleAddStudent,
        handleRequestRemoveStudent,
        handleCancelRemoveStudent,
        handleConfirmRemoveStudent,
        handleBalanceDraftChange,
        handleBalanceAdjust,
        handleBalanceSubmit,
        handleStartNoteEdit,
        handleCancelNoteEdit,
        handleSaveNote,
        handleAwardLoyalty,
        handleCorrectLoyalty,
        handleRevokeLoyalty,
        handleRetry: () => loadDetails(false),
        handleHistoryRetry: loadHistory,
        handleLoyaltyRetry: loadLoyaltyHistory,
    };
}
