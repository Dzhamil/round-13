import { MEMBER_DETAILS_TEXT } from "../../../model/members.constants";
import { formatDateTime } from "../../../model/members.helpers";
import type { TrainerStudentNote } from "../../../model/members.types";
import {
    ButtonRow,
    EmptyState,
    FieldLabel,
    MetaText,
    NoteText,
    PrimaryButton,
    SecondaryButton,
    Section,
    SectionCard,
    SectionHeader,
    SectionHint,
    SectionTitle,
    TextArea,
} from "./memberDetailsModal.styles";

type Props = {
    note: TrainerStudentNote | null
    editing: boolean
    draft: string
    saving: boolean
    onDraftChange: (value: string) => void
    onEdit: () => void
    onCancel: () => void
    onSave: () => void
}

function renderMeta(note: TrainerStudentNote | null) {
    if (!note?.updatedAt || !note.updatedByName) {
        return MEMBER_DETAILS_TEXT.noteMetaFallback;
    }

    return `${MEMBER_DETAILS_TEXT.lastUpdatedPrefix} ${note.updatedByName}, ${formatDateTime(note.updatedAt)}`;
}

export function CoachNoteSection({
    note,
    editing,
    draft,
    saving,
    onDraftChange,
    onEdit,
    onCancel,
    onSave,
}: Props) {
    const hasNote = Boolean(note?.note?.trim());

    return (
        <Section>
            <SectionHeader>
                <div>
                    <SectionTitle>{MEMBER_DETAILS_TEXT.noteTitle}</SectionTitle>
                    <SectionHint>{renderMeta(note)}</SectionHint>
                </div>
                {!editing && (
                    <PrimaryButton type="button" onClick={onEdit}>
                        {hasNote ? MEMBER_DETAILS_TEXT.editNote : MEMBER_DETAILS_TEXT.addNote}
                    </PrimaryButton>
                )}
            </SectionHeader>

            <SectionCard>
                {editing ? (
                    <>
                        <FieldLabel htmlFor="member-note">
                            Приватная заметка видна только тренеру и административной команде.
                        </FieldLabel>
                        <TextArea
                            id="member-note"
                            value={draft}
                            onChange={(event) => onDraftChange(event.target.value)}
                            placeholder={MEMBER_DETAILS_TEXT.notePlaceholder}
                        />
                        <ButtonRow>
                            <PrimaryButton type="button" onClick={onSave} disabled={saving}>
                                {saving ? "Сохраняем…" : MEMBER_DETAILS_TEXT.saveNote}
                            </PrimaryButton>
                            <SecondaryButton type="button" onClick={onCancel} disabled={saving}>
                                {MEMBER_DETAILS_TEXT.cancel}
                            </SecondaryButton>
                        </ButtonRow>
                    </>
                ) : hasNote ? (
                    <NoteText>{note?.note}</NoteText>
                ) : (
                    <EmptyState>{MEMBER_DETAILS_TEXT.noteEmpty}</EmptyState>
                )}
                {!editing && <MetaText style={{ marginTop: 12 }}>{renderMeta(note)}</MetaText>}
            </SectionCard>
        </Section>
    );
}
