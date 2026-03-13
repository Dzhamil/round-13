import { useCallback, useEffect, useMemo, useState } from "react";
import {
    addStudent,
    getMemberDetails,
    getStudentHistory,
    removeStudent,
    updateStudentCoachNote,
    updateStudentRemainingTrainings,
} from "../api/members.api";
import { MEMBER_DETAILS_TEXT } from "./members.constants";
import { toNumericDraft } from "./members.helpers";
import type { MemberDetails, MemberListItem, TrainerStudentHistory } from "./members.types";
import { useIsCoach } from "./useIsCoach";

type Params = {
    open: boolean
    member: MemberListItem | null
    onStudentChanged?: () => void
}

function buildPreviewMember(member: MemberListItem, details: MemberDetails | null): MemberListItem {
    if (!details) {
        return member;
    }

    return {
        id: details.id,
        nickname: details.nickname,
        phone: details.phone,
        avatarUrl: details.avatarUrl,
        points: details.points,
        statusLabel: details.statusLabel,
        roleCode: details.roleCode,
        remainingTrainings: details.remainingTrainings,
    };
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
        return error.message;
    }

    return fallback;
}

export function useMemberDetailsModal({ open, member, onStudentChanged }: Params) {
    const [activeTab, setActiveTab] = useState<"OVERVIEW" | "HISTORY">("OVERVIEW");
    const isCoach = useIsCoach();
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

    const preview = useMemo(() => {
        if (!member) {
            return null;
        }

        return buildPreviewMember(member, details);
    }, [details, member]);

    const canManageStudent = isCoach && details != null && details.roleCode !== "COACH" && details.roleCode !== "ADMIN";

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
            setBalanceDraft("0");
            setNoteDraft("");
            setEditingNote(false);
            return;
        }

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

    const handleRemoveStudent = useCallback(async () => {
        if (!details) {
            return;
        }

        try {
            setError(null);
            await removeStudent(details.id);
            setEditingNote(false);
            setHistory(null);
            onStudentChanged?.();
            await loadDetails(true);
        } catch (nextError) {
            setError(getErrorMessage(nextError, MEMBER_DETAILS_TEXT.removeStudentError));
        }
    }, [details, loadDetails, onStudentChanged]);

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
        setNoteDraft,
        handleAddStudent,
        handleRemoveStudent,
        handleBalanceDraftChange,
        handleBalanceAdjust,
        handleBalanceSubmit,
        handleStartNoteEdit,
        handleCancelNoteEdit,
        handleSaveNote,
        handleRetry: () => loadDetails(false),
        handleHistoryRetry: loadHistory,
    };
}
