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
        studentActionIsStudent,
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
        handleRetry,
        handleHistoryRetry,
    } = useMemberDetailsModal({
        open,
        member,
        onStudentChanged,
        onAdminStudentRemoved: onClose,
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
            studentActionIsStudent={studentActionIsStudent}
            removeConfirmOpen={removeConfirmOpen}
            removeConfirmationBody={removeConfirmationBody}
            removingStudent={removingStudent}
            onClose={onClose}
            onTabChange={setActiveTab}
            onRetry={handleRetry}
            onHistoryRetry={handleHistoryRetry}
            onAddStudent={handleAddStudent}
            onRequestRemoveStudent={handleRequestRemoveStudent}
            onCancelRemoveStudent={handleCancelRemoveStudent}
            onConfirmRemoveStudent={handleConfirmRemoveStudent}
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
