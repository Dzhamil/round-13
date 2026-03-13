import { MEMBER_DETAILS_TEXT } from "../../../model/members.constants";
import { ActionButton, EmptyState, Section, SectionHeader, SectionTitle } from "./memberDetailsModal.styles";

type Props = {
    isStudent: boolean
    showEmptyState: boolean
    onAddStudent: () => void
    onRemoveStudent: () => void
}

export function MemberStudentActionSection({ isStudent, showEmptyState, onAddStudent, onRemoveStudent }: Props) {
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
                {isStudent ? (
                    <ActionButton type="button" $danger onClick={onRemoveStudent}>
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
