import { MEMBER_DETAILS_TEXT } from "../../../model/members.constants";
import {
    ActionButton,
    ButtonRow,
    DangerButton,
    EmptyState,
    Section,
    SectionHeader,
    SectionTitle,
    SecondaryButton,
} from "./memberDetailsModal.styles";

type Props = {
    isStudent: boolean
    showEmptyState: boolean
    removeConfirmOpen: boolean
    removeConfirmationBody: string
    removingStudent: boolean
    onAddStudent: () => void
    onRequestRemoveStudent: () => void
    onCancelRemoveStudent: () => void
    onConfirmRemoveStudent: () => void
}

export function MemberStudentActionSection({
    isStudent,
    showEmptyState,
    removeConfirmOpen,
    removeConfirmationBody,
    removingStudent,
    onAddStudent,
    onRequestRemoveStudent,
    onCancelRemoveStudent,
    onConfirmRemoveStudent,
}: Props) {
    return (
        <>
            {!isStudent && showEmptyState && (
                <Section>
                    <SectionHeader>
                        <div>
                            <SectionTitle>{MEMBER_DETAILS_TEXT.coachCardTitle}</SectionTitle>
                        </div>
                    </SectionHeader>
                    <EmptyState>{MEMBER_DETAILS_TEXT.coachCardEmpty}</EmptyState>
                </Section>
            )}

            <Section>
                {isStudent && removeConfirmOpen ? (
                    <>
                        <SectionHeader>
                            <div>
                                <SectionTitle>{MEMBER_DETAILS_TEXT.removeStudentConfirmTitle}</SectionTitle>
                            </div>
                        </SectionHeader>
                        <EmptyState>{removeConfirmationBody}</EmptyState>
                        <ButtonRow>
                            <SecondaryButton type="button" disabled={removingStudent} onClick={onCancelRemoveStudent}>
                                {MEMBER_DETAILS_TEXT.cancel}
                            </SecondaryButton>
                            <DangerButton type="button" disabled={removingStudent} onClick={onConfirmRemoveStudent}>
                                {removingStudent
                                    ? MEMBER_DETAILS_TEXT.removeStudentRemoving
                                    : MEMBER_DETAILS_TEXT.removeStudentConfirm}
                            </DangerButton>
                        </ButtonRow>
                    </>
                ) : isStudent ? (
                    <ActionButton type="button" $danger onClick={onRequestRemoveStudent}>
                        {MEMBER_DETAILS_TEXT.removeStudent}
                    </ActionButton>
                ) : (
                    <ActionButton type="button" onClick={onAddStudent}>
                        {MEMBER_DETAILS_TEXT.addStudent}
                    </ActionButton>
                )}
            </Section>
        </>
    );
}
