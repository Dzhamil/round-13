import { MEMBER_DETAILS_TEXT } from "../../../model/members.constants";
import {
    BalanceControls,
    ButtonRow,
    FieldLabel,
    NumberInput,
    PrimaryButton,
    SecondaryButton,
    Section,
    SectionHeader,
    SectionHint,
    SectionTitle,
} from "./memberDetailsModal.styles";

type Props = {
    remainingTrainings: number
    balanceDraft: string
    saving: boolean
    onDraftChange: (value: string) => void
    onAdjust: (delta: number) => void
    onSubmit: () => void
}

export function StudentBalanceSection({
    remainingTrainings,
    balanceDraft,
    saving,
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
        </Section>
    );
}
