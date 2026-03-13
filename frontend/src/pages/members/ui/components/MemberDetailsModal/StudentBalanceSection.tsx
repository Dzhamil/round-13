import { MEMBER_DETAILS_TEXT } from "../../../model/members.constants";
import { buildBalanceHistoryTitle, formatDateTime } from "../../../model/members.helpers";
import type { TrainingBalanceHistoryItem } from "../../../model/members.types";
import {
    BalanceControls,
    ButtonRow,
    DeltaBadge,
    EmptyState,
    FieldLabel,
    NumberInput,
    PrimaryButton,
    SecondaryButton,
    Section,
    SectionHeader,
    SectionHint,
    SectionTitle,
    TimelineItem,
    TimelineList,
    TimelineMeta,
    TimelineTitle,
    TimelineTitleRow,
} from "./memberDetailsModal.styles";

type Props = {
    remainingTrainings: number
    balanceDraft: string
    saving: boolean
    events: TrainingBalanceHistoryItem[]
    onDraftChange: (value: string) => void
    onAdjust: (delta: number) => void
    onSubmit: () => void
}

export function StudentBalanceSection({
    remainingTrainings,
    balanceDraft,
    saving,
    events,
    onDraftChange,
    onAdjust,
    onSubmit,
}: Props) {
    const nextValue = Number.parseInt(balanceDraft || "0", 10);
    const disabled = saving || Number.isNaN(nextValue) || nextValue === remainingTrainings;

    return (
        <Section>
            <SectionHeader>
                <div>
                    <SectionTitle>{MEMBER_DETAILS_TEXT.balanceTitle}</SectionTitle>
                    <SectionHint>Можно быстро скорректировать остаток и сразу увидеть последние списания и начисления.</SectionHint>
                </div>
            </SectionHeader>

            <FieldLabel htmlFor="member-balance">Текущий остаток</FieldLabel>
            <BalanceControls>
                <SecondaryButton type="button" onClick={() => onAdjust(-1)} disabled={saving}>
                    -1
                </SecondaryButton>
                <NumberInput
                    id="member-balance"
                    inputMode="numeric"
                    value={balanceDraft}
                    onChange={(event) => onDraftChange(event.target.value)}
                />
                <SecondaryButton type="button" onClick={() => onAdjust(1)} disabled={saving}>
                    +1
                </SecondaryButton>
            </BalanceControls>

            <ButtonRow>
                <PrimaryButton type="button" onClick={onSubmit} disabled={disabled}>
                    {saving ? "Сохраняем…" : MEMBER_DETAILS_TEXT.saveBalance}
                </PrimaryButton>
            </ButtonRow>

            <SectionHeader style={{ marginTop: 18 }}>
                <div>
                    <SectionTitle>Последние изменения баланса</SectionTitle>
                </div>
            </SectionHeader>

            {events.length === 0 ? (
                <EmptyState>{MEMBER_DETAILS_TEXT.balanceHistoryEmpty}</EmptyState>
            ) : (
                <TimelineList>
                    {events.map((item) => (
                        <TimelineItem key={item.id}>
                            <TimelineTitleRow>
                                <div>
                                    <TimelineTitle>{buildBalanceHistoryTitle(item)}</TimelineTitle>
                                    <TimelineMeta>{item.createdByName ?? "Сотрудник"}</TimelineMeta>
                                </div>
                                <DeltaBadge $positive={item.delta > 0}>
                                    {item.delta > 0 ? `+${item.delta}` : item.delta}
                                </DeltaBadge>
                            </TimelineTitleRow>
                            <TimelineMeta>Остаток после операции: {item.balanceAfter}</TimelineMeta>
                            <TimelineMeta>{formatDateTime(item.createdAt)}</TimelineMeta>
                        </TimelineItem>
                    ))}
                </TimelineList>
            )}
        </Section>
    );
}
