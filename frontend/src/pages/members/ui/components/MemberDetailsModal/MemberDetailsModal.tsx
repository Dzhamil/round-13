import type { MemberDetails, MemberListItem, TrainerStudentHistory } from "../../../model/members.types";
import { MEMBER_DETAILS_TEXT } from "../../../model/members.constants";
import { MiniUserCard } from "../MiniUserCard/MiniUserCard";
import { CoachNoteSection } from "./CoachNoteSection";
import { MemberProfileSection } from "./MemberProfileSection";
import { MemberStudentActionSection } from "./MemberStudentActionSection";
import { StudentBalanceSection } from "./StudentBalanceSection";
import { StudentHistoryTab } from "./StudentHistoryTab";
import { StudentStatusSection } from "./StudentStatusSection";
import {
    ActionButton,
    Backdrop,
    CloseButton,
    EmptyState,
    ErrorBanner,
    InlineNotice,
    LoadingText,
    ModalContainer,
    Section,
    TabButton,
    TabsRow,
} from "./memberDetailsModal.styles";

type Props = {
    open: boolean
    member: MemberListItem | null
    preview: MemberListItem | null
    details: MemberDetails | null
    activeTab: "OVERVIEW" | "HISTORY"
    loading: boolean
    refreshing: boolean
    error: string | null
    canManageStudent: boolean
    balanceDraft: string
    savingBalance: boolean
    noteDraft: string
    editingNote: boolean
    savingNote: boolean
    history: TrainerStudentHistory | null
    historyLoading: boolean
    historyError: string | null
    onClose: () => void
    onTabChange: (tab: "OVERVIEW" | "HISTORY") => void
    onRetry: () => void
    onHistoryRetry: () => void
    onAddStudent: () => void
    onRemoveStudent: () => void
    onBalanceDraftChange: (value: string) => void
    onBalanceAdjust: (delta: number) => void
    onBalanceSubmit: () => void
    onStartNoteEdit: () => void
    onCancelNoteEdit: () => void
    onSaveNote: () => void
    onNoteDraftChange: (value: string) => void
}

export function MemberDetailsModalView({
    open,
    member,
    preview,
    details,
    activeTab,
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
    onClose,
    onTabChange,
    onRetry,
    onHistoryRetry,
    onAddStudent,
    onRemoveStudent,
    onBalanceDraftChange,
    onBalanceAdjust,
    onBalanceSubmit,
    onStartNoteEdit,
    onCancelNoteEdit,
    onSaveNote,
    onNoteDraftChange,
}: Props) {
    if (!open || !member || !preview) {
        return null;
    }

    const trainerCard = details?.trainerStudentCard ?? null;

    return (
        <Backdrop onClick={onClose}>
            <ModalContainer onClick={(event) => event.stopPropagation()}>
                <CloseButton type="button" onClick={onClose}>
                    ✕
                </CloseButton>

                <MiniUserCard member={preview} />

                {canManageStudent && details?.myStudent && (
                    <TabsRow>
                        <TabButton type="button" $active={activeTab === "OVERVIEW"} onClick={() => onTabChange("OVERVIEW")}>
                            {MEMBER_DETAILS_TEXT.overviewTab}
                        </TabButton>
                        <TabButton type="button" $active={activeTab === "HISTORY"} onClick={() => onTabChange("HISTORY")}>
                            {MEMBER_DETAILS_TEXT.historyTab}
                        </TabButton>
                    </TabsRow>
                )}

                {loading && <LoadingText>{MEMBER_DETAILS_TEXT.loading}</LoadingText>}
                {!loading && refreshing && <InlineNotice>{MEMBER_DETAILS_TEXT.refreshing}</InlineNotice>}
                {error && <ErrorBanner>{error}</ErrorBanner>}

                {!loading && !details && (
                    <Section>
                        <EmptyState>{MEMBER_DETAILS_TEXT.loadError}</EmptyState>
                        <ActionButton type="button" style={{ marginTop: 12 }} onClick={onRetry}>
                            {MEMBER_DETAILS_TEXT.retry}
                        </ActionButton>
                    </Section>
                )}

                {!loading && details && (
                    <>
                        <MemberProfileSection details={details} />

                        {canManageStudent && details.myStudent && trainerCard && activeTab === "OVERVIEW" && (
                            <>
                                <StudentStatusSection
                                    status={trainerCard.operationalStatus}
                                    remainingTrainings={details.remainingTrainings}
                                    nextTraining={trainerCard.nextTraining}
                                />
                                <CoachNoteSection
                                    note={trainerCard.trainerNote}
                                    editing={editingNote}
                                    draft={noteDraft}
                                    saving={savingNote}
                                    onDraftChange={onNoteDraftChange}
                                    onEdit={onStartNoteEdit}
                                    onCancel={onCancelNoteEdit}
                                    onSave={onSaveNote}
                                />
                                <StudentBalanceSection
                                    remainingTrainings={details.remainingTrainings ?? 0}
                                    balanceDraft={balanceDraft}
                                    saving={savingBalance}
                                    onDraftChange={onBalanceDraftChange}
                                    onAdjust={onBalanceAdjust}
                                    onSubmit={onBalanceSubmit}
                                />
                            </>
                        )}

                        {canManageStudent && details.myStudent && activeTab === "HISTORY" && (
                            <StudentHistoryTab
                                history={history}
                                loading={historyLoading}
                                error={historyError}
                                onRetry={onHistoryRetry}
                            />
                        )}

                        {canManageStudent && (
                            <MemberStudentActionSection
                                isStudent={details.myStudent}
                                showEmptyState={!details.myStudent}
                                onAddStudent={onAddStudent}
                                onRemoveStudent={onRemoveStudent}
                            />
                        )}
                    </>
                )}
            </ModalContainer>
        </Backdrop>
    );
}
