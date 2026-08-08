import { useMemo, useState } from "react";
import type {
    LoyaltyPointHistoryItem,
    LoyaltyPointSourceType,
    ManualPointAwardRequest,
    PointCorrectionRequest,
    PointRevokeRequest,
} from "../../../../../shared/api/loyalty.api";
import {
    formatLoyaltyDate,
    formatLoyaltyDelta,
    getLoyaltySourceLabel,
    isCorrectionEntry,
} from "../../../../../shared/api/loyalty.helpers";
import {
    ActionButton,
    ButtonRow,
    DeltaBadge,
    EmptyState,
    FieldLabel,
    FormGrid,
    InlineNotice,
    NumberInput,
    PrimaryButton,
    SecondaryButton,
    Section,
    SectionCard,
    SectionHeader,
    SectionHint,
    SectionTitle,
    SelectInput,
    SmallActionButton,
    TextArea,
    TextInput,
    TimelineItem,
    TimelineList,
    TimelineMeta,
    TimelineTitle,
    TimelineTitleRow,
} from "./memberDetailsModal.styles";

const AWARD_SOURCE_OPTIONS: Array<{ value: LoyaltyPointSourceType; label: string }> = [
    { value: "MANUAL_ADJUSTMENT", label: "Ручная запись" },
    { value: "CLUB_EVENT_ATTENDANCE", label: "Событие клуба" },
    { value: "RECRUITMENT", label: "Привёл участника" },
    { value: "INITIATION", label: "Посвящение" },
    { value: "FITNESS_NORM_IMPROVEMENT", label: "Физическая динамика" },
    { value: "MONTHLY_COMPLEX_PLACEMENT", label: "Месячный комплекс" },
    { value: "CLAN_WAR_PLACEMENT", label: "Война кланов" },
    { value: "PHYSICAL_PREPARATION_CHAMPIONSHIP", label: "ОФП чемпионат" },
    { value: "BOXING_MATCH", label: "Боксёрский бой" },
];

type AwardDraft = {
    sourceType: LoyaltyPointSourceType;
    ruleCode: string;
    pointsDelta: string;
    reason: string;
    place: string;
    rounds: string;
    outcome: string;
    improvementPercent: string;
};

type CorrectionDraft = {
    entryId: string;
    pointsDelta: string;
    reason: string;
};

type RevokeDraft = {
    entryId: string;
    reason: string;
};

type Props = {
    memberId: string;
    isAdmin: boolean;
    history: LoyaltyPointHistoryItem[];
    loading: boolean;
    saving: boolean;
    error: string | null;
    onRetry: () => void;
    onAward: (request: ManualPointAwardRequest) => Promise<void>;
    onCorrect: (entryId: string, request: PointCorrectionRequest) => Promise<void>;
    onRevoke: (entryId: string, request: PointRevokeRequest) => Promise<void>;
};

const INITIAL_AWARD: AwardDraft = {
    sourceType: "MANUAL_ADJUSTMENT",
    ruleCode: "",
    pointsDelta: "",
    reason: "",
    place: "",
    rounds: "3",
    outcome: "WIN",
    improvementPercent: "",
};

function parseOptionalInteger(value: string): number | null {
    if (!value.trim()) {
        return null;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalFloat(value: string): number | null {
    if (!value.trim()) {
        return null;
    }

    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
}

function buildMetadata(draft: AwardDraft): Record<string, unknown> | null {
    if (draft.sourceType === "BOXING_MATCH") {
        return {
            rounds: Number.parseInt(draft.rounds, 10),
            outcome: draft.outcome,
        };
    }

    if (
        draft.sourceType === "MONTHLY_COMPLEX_PLACEMENT" ||
        draft.sourceType === "CLAN_WAR_PLACEMENT" ||
        draft.sourceType === "PHYSICAL_PREPARATION_CHAMPIONSHIP"
    ) {
        const place = parseOptionalInteger(draft.place);
        return place == null ? null : { place };
    }

    if (draft.sourceType === "FITNESS_NORM_IMPROVEMENT") {
        const improvementPercent = parseOptionalFloat(draft.improvementPercent);
        return improvementPercent == null ? null : { improvementPercent };
    }

    return null;
}

function isRuleBackedSource(sourceType: LoyaltyPointSourceType): boolean {
    return sourceType !== "MANUAL_ADJUSTMENT";
}

export function LoyaltyPointsTab({
    memberId,
    isAdmin,
    history,
    loading,
    saving,
    error,
    onRetry,
    onAward,
    onCorrect,
    onRevoke,
}: Props) {
    const [awardDraft, setAwardDraft] = useState<AwardDraft>(INITIAL_AWARD);
    const [awardError, setAwardError] = useState<string | null>(null);
    const [correctionDraft, setCorrectionDraft] = useState<CorrectionDraft | null>(null);
    const [revokeDraft, setRevokeDraft] = useState<RevokeDraft | null>(null);

    const selectedNeedsRule = isRuleBackedSource(awardDraft.sourceType);
    const canSubmitAward = useMemo(() => {
        if (!awardDraft.reason.trim()) {
            return false;
        }

        if (selectedNeedsRule) {
            return Boolean(awardDraft.ruleCode.trim());
        }

        return parseOptionalInteger(awardDraft.pointsDelta) !== null;
    }, [awardDraft, selectedNeedsRule]);

    async function submitAward(): Promise<void> {
        setAwardError(null);
        if (!canSubmitAward) {
            setAwardError(selectedNeedsRule
                ? "Укажите код backend-правила и причину."
                : "Укажите дельту баллов и причину.");
            return;
        }

        const metadata = buildMetadata(awardDraft);
        if (
            selectedNeedsRule &&
            (awardDraft.sourceType === "BOXING_MATCH" ||
                awardDraft.sourceType === "MONTHLY_COMPLEX_PLACEMENT" ||
                awardDraft.sourceType === "CLAN_WAR_PLACEMENT" ||
                awardDraft.sourceType === "PHYSICAL_PREPARATION_CHAMPIONSHIP" ||
                awardDraft.sourceType === "FITNESS_NORM_IMPROVEMENT") &&
            metadata == null
        ) {
            setAwardError("Заполните semantic поля для выбранного источника.");
            return;
        }

        await onAward({
            memberId,
            sourceType: awardDraft.sourceType,
            ruleCode: awardDraft.ruleCode.trim() || null,
            pointsDelta: selectedNeedsRule ? null : parseOptionalInteger(awardDraft.pointsDelta),
            reason: awardDraft.reason.trim(),
            metadata,
        });
        setAwardDraft(INITIAL_AWARD);
    }

    async function submitCorrection(): Promise<void> {
        if (!correctionDraft) {
            return;
        }

        const pointsDelta = parseOptionalInteger(correctionDraft.pointsDelta);
        if (pointsDelta == null || !correctionDraft.reason.trim()) {
            return;
        }

        await onCorrect(correctionDraft.entryId, {
            pointsDelta,
            reason: correctionDraft.reason.trim(),
        });
        setCorrectionDraft(null);
    }

    async function submitRevoke(): Promise<void> {
        if (!revokeDraft || !revokeDraft.reason.trim()) {
            return;
        }

        await onRevoke(revokeDraft.entryId, {
            reason: revokeDraft.reason.trim(),
        });
        setRevokeDraft(null);
    }

    return (
        <>
            <Section>
                <SectionHeader>
                    <div>
                        <SectionTitle>Баллы</SectionTitle>
                        <SectionHint>Источник и semantic поля уходят в backend; значения правил здесь не задаются.</SectionHint>
                    </div>
                </SectionHeader>
                <SectionCard>
                    <FormGrid>
                        <label>
                            <FieldLabel>Источник</FieldLabel>
                            <SelectInput
                                value={awardDraft.sourceType}
                                onChange={(event) => setAwardDraft((current) => ({
                                    ...current,
                                    sourceType: event.target.value as LoyaltyPointSourceType,
                                }))}
                                disabled={saving}
                            >
                                {AWARD_SOURCE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </SelectInput>
                        </label>
                        <label>
                            <FieldLabel>{selectedNeedsRule ? "Код правила backend" : "Дельта баллов"}</FieldLabel>
                            {selectedNeedsRule ? (
                                <TextInput
                                    value={awardDraft.ruleCode}
                                    onChange={(event) => setAwardDraft((current) => ({ ...current, ruleCode: event.target.value }))}
                                    placeholder="например, rule code"
                                    disabled={saving}
                                />
                            ) : (
                                <NumberInput
                                    value={awardDraft.pointsDelta}
                                    onChange={(event) => setAwardDraft((current) => ({ ...current, pointsDelta: event.target.value }))}
                                    inputMode="numeric"
                                    placeholder="например, 5 или -5"
                                    disabled={saving}
                                />
                            )}
                        </label>
                    </FormGrid>

                    {awardDraft.sourceType === "BOXING_MATCH" ? (
                        <FormGrid style={{ marginTop: 10 }}>
                            <label>
                                <FieldLabel>Раунды</FieldLabel>
                                <SelectInput
                                    value={awardDraft.rounds}
                                    onChange={(event) => setAwardDraft((current) => ({ ...current, rounds: event.target.value }))}
                                    disabled={saving}
                                >
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="6">6</option>
                                </SelectInput>
                            </label>
                            <label>
                                <FieldLabel>Результат</FieldLabel>
                                <SelectInput
                                    value={awardDraft.outcome}
                                    onChange={(event) => setAwardDraft((current) => ({ ...current, outcome: event.target.value }))}
                                    disabled={saving}
                                >
                                    <option value="WIN">Победа</option>
                                    <option value="LOSS">Поражение</option>
                                </SelectInput>
                            </label>
                        </FormGrid>
                    ) : null}

                    {(awardDraft.sourceType === "MONTHLY_COMPLEX_PLACEMENT" ||
                        awardDraft.sourceType === "CLAN_WAR_PLACEMENT" ||
                        awardDraft.sourceType === "PHYSICAL_PREPARATION_CHAMPIONSHIP") ? (
                        <label style={{ display: "block", marginTop: 10 }}>
                            <FieldLabel>Место</FieldLabel>
                            <NumberInput
                                value={awardDraft.place}
                                onChange={(event) => setAwardDraft((current) => ({ ...current, place: event.target.value }))}
                                inputMode="numeric"
                                disabled={saving}
                            />
                        </label>
                    ) : null}

                    {awardDraft.sourceType === "FITNESS_NORM_IMPROVEMENT" ? (
                        <label style={{ display: "block", marginTop: 10 }}>
                            <FieldLabel>Улучшение, %</FieldLabel>
                            <TextInput
                                value={awardDraft.improvementPercent}
                                onChange={(event) => setAwardDraft((current) => ({ ...current, improvementPercent: event.target.value }))}
                                inputMode="decimal"
                                disabled={saving}
                            />
                        </label>
                    ) : null}

                    <label style={{ display: "block", marginTop: 10 }}>
                        <FieldLabel>Причина</FieldLabel>
                        <TextArea
                            value={awardDraft.reason}
                            onChange={(event) => setAwardDraft((current) => ({ ...current, reason: event.target.value }))}
                            disabled={saving}
                            style={{ minHeight: 86 }}
                        />
                    </label>

                    {awardError ? <InlineNotice>{awardError}</InlineNotice> : null}
                    <ButtonRow>
                        <PrimaryButton type="button" onClick={() => void submitAward()} disabled={!canSubmitAward || saving}>
                            {saving ? "Сохранение..." : "Начислить"}
                        </PrimaryButton>
                    </ButtonRow>
                </SectionCard>
            </Section>

            <Section>
                <SectionHeader>
                    <div>
                        <SectionTitle>История баллов</SectionTitle>
                    </div>
                    <SecondaryButton type="button" onClick={onRetry} disabled={loading || saving}>
                        Обновить
                    </SecondaryButton>
                </SectionHeader>

                {error ? <InlineNotice>{error}</InlineNotice> : null}
                {loading ? <EmptyState>История загружается...</EmptyState> : null}
                {!loading && history.length === 0 ? <EmptyState>История баллов пока пустая.</EmptyState> : null}

                {!loading && history.length > 0 ? (
                    <TimelineList>
                        {history.map((item) => (
                            <TimelineItem key={item.id}>
                                <TimelineTitleRow>
                                    <TimelineTitle>{item.reason || getLoyaltySourceLabel(item.sourceType)}</TimelineTitle>
                                    <DeltaBadge $positive={item.pointsDelta >= 0}>{formatLoyaltyDelta(item.pointsDelta)}</DeltaBadge>
                                </TimelineTitleRow>
                                <TimelineMeta>
                                    {getLoyaltySourceLabel(item.sourceType)}
                                    {item.eventDate ? ` · ${formatLoyaltyDate(item.eventDate)}` : ""}
                                    {isCorrectionEntry(item) ? " · audit" : ""}
                                </TimelineMeta>
                                {isAdmin ? (
                                    <ButtonRow>
                                        <SmallActionButton
                                            type="button"
                                            onClick={() => setCorrectionDraft({ entryId: item.id, pointsDelta: "", reason: "" })}
                                            disabled={saving}
                                        >
                                            Коррекция
                                        </SmallActionButton>
                                        <SmallActionButton
                                            type="button"
                                            $danger
                                            onClick={() => setRevokeDraft({ entryId: item.id, reason: "" })}
                                            disabled={saving}
                                        >
                                            Отозвать
                                        </SmallActionButton>
                                    </ButtonRow>
                                ) : null}
                            </TimelineItem>
                        ))}
                    </TimelineList>
                ) : null}
            </Section>

            {correctionDraft ? (
                <Section>
                    <SectionHeader>
                        <div>
                            <SectionTitle>Коррекция записи</SectionTitle>
                        </div>
                    </SectionHeader>
                    <SectionCard>
                        <label>
                            <FieldLabel>Дельта коррекции</FieldLabel>
                            <NumberInput
                                value={correctionDraft.pointsDelta}
                                onChange={(event) => setCorrectionDraft((current) => current
                                    ? { ...current, pointsDelta: event.target.value }
                                    : current)}
                                inputMode="numeric"
                                disabled={saving}
                            />
                        </label>
                        <label style={{ display: "block", marginTop: 10 }}>
                            <FieldLabel>Причина</FieldLabel>
                            <TextArea
                                value={correctionDraft.reason}
                                onChange={(event) => setCorrectionDraft((current) => current
                                    ? { ...current, reason: event.target.value }
                                    : current)}
                                disabled={saving}
                                style={{ minHeight: 86 }}
                            />
                        </label>
                        <ButtonRow>
                            <PrimaryButton type="button" onClick={() => void submitCorrection()} disabled={saving}>
                                Сохранить
                            </PrimaryButton>
                            <SecondaryButton type="button" onClick={() => setCorrectionDraft(null)} disabled={saving}>
                                Отмена
                            </SecondaryButton>
                        </ButtonRow>
                    </SectionCard>
                </Section>
            ) : null}

            {revokeDraft ? (
                <Section>
                    <SectionHeader>
                        <div>
                            <SectionTitle>Отзыв записи</SectionTitle>
                        </div>
                    </SectionHeader>
                    <SectionCard>
                        <label>
                            <FieldLabel>Причина</FieldLabel>
                            <TextArea
                                value={revokeDraft.reason}
                                onChange={(event) => setRevokeDraft((current) => current
                                    ? { ...current, reason: event.target.value }
                                    : current)}
                                disabled={saving}
                                style={{ minHeight: 86 }}
                            />
                        </label>
                        <ButtonRow>
                            <ActionButton type="button" $danger onClick={() => void submitRevoke()} disabled={saving}>
                                Отозвать
                            </ActionButton>
                            <SecondaryButton type="button" onClick={() => setRevokeDraft(null)} disabled={saving}>
                                Отмена
                            </SecondaryButton>
                        </ButtonRow>
                    </SectionCard>
                </Section>
            ) : null}
        </>
    );
}
