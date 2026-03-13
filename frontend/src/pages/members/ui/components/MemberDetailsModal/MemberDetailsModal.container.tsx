import type { MemberListItem } from "../../../model/members.types";
import { useMemberDetailsModal } from "../../../model/useMemberDetailsModal";
import { MemberDetailsModalView } from "./MemberDetailsModal";

type Props = {
    open: boolean
    member: MemberListItem | null
    onClose: () => void
    onStudentChanged?: () => void
}

export function MemberDetailsModal({ open, member, onClose, onStudentChanged }: Props) {
    const {
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
        handleRetry,
        handleHistoryRetry,
    } = useMemberDetailsModal({
        open,
        member,
        onStudentChanged,
    });

    return (
        <MemberDetailsModalView
            open={open}
            member={member}
            preview={preview}
            details={details}
            activeTab={activeTab}
            loading={loading}
            refreshing={refreshing}
            error={error}
            canManageStudent={canManageStudent}
            balanceDraft={balanceDraft}
            savingBalance={savingBalance}
            noteDraft={noteDraft}
            editingNote={editingNote}
            savingNote={savingNote}
            history={history}
            historyLoading={historyLoading}
            historyError={historyError}
            onClose={onClose}
            onTabChange={setActiveTab}
            onRetry={handleRetry}
            onHistoryRetry={handleHistoryRetry}
            onAddStudent={handleAddStudent}
            onRemoveStudent={handleRemoveStudent}
            onBalanceDraftChange={handleBalanceDraftChange}
            onBalanceAdjust={handleBalanceAdjust}
            onBalanceSubmit={handleBalanceSubmit}
            onStartNoteEdit={handleStartNoteEdit}
            onCancelNoteEdit={handleCancelNoteEdit}
            onSaveNote={handleSaveNote}
            onNoteDraftChange={setNoteDraft}
        />
    );
}
