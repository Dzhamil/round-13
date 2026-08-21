import { useMemo, useState } from "react";
import {
    BOXER_POTENTIAL_CHARACTERISTICS,
    EMPTY_RAW_VALUES,
    getCharacteristicConfig,
    getTestConfig,
} from "../../../model/boxerPotential.config";
import { formatPotentialDate, formatPotentialScore } from "../../../model/boxerPotential.helpers";
import type {
    BoxerPotentialCharacteristicKey,
    BoxerPotentialMeasurement,
    BoxerPotentialMeasurementRequest,
    BoxerPotentialPeriod,
    BoxerPotentialRawValues,
    BoxerPotentialTestKey,
} from "../../../model/boxerPotential.types";
import { useBoxerPotential } from "../../../model/useBoxerPotential";
import { BoxerPotentialChart } from "./BoxerPotentialChart";
import { BoxerPotentialForm } from "./BoxerPotentialForm";
import {
    ButtonRow,
    EmptyState,
    ErrorBanner,
    FieldLabel,
    InlineNotice,
    KeyValueList,
    KeyValueRow,
    LoadingText,
    MetaText,
    NumberInput,
    PrimaryButton,
    SecondaryButton,
    Section,
    SectionCard,
    SectionHeader,
    SectionHint,
    SectionTitle,
    StatCard,
    StatGrid,
    StatLabel,
    StatValue,
    TimelineItem,
    TimelineList,
    TimelineMeta,
    TimelineTitle,
    TimelineTitleRow,
} from "./memberDetailsModal.styles";

type Screen =
    | { name: "overview" }
    | { name: "characteristic"; characteristic: BoxerPotentialCharacteristicKey }
    | { name: "test"; test: BoxerPotentialTestKey };

type Props = {
    memberId: string
    active: boolean
}

const PERIOD_LABELS: Record<BoxerPotentialPeriod, string> = {
    week: "неделя",
    month: "месяц",
    year: "год",
};

function toLocalDateTimeInputValue(date: Date): string {
    const offsetMs = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function measurementRequest(measuredAt: string, raw: BoxerPotentialRawValues): BoxerPotentialMeasurementRequest {
    return {
        measuredAt: new Date(measuredAt).toISOString(),
        ...raw,
    };
}

function characteristicScore(measurement: BoxerPotentialMeasurement | null, key: BoxerPotentialCharacteristicKey): number {
    if (!measurement) {
        return 0;
    }
    return measurement.characteristicScores[key];
}

function testScore(measurement: BoxerPotentialMeasurement | null, key: BoxerPotentialTestKey): number {
    const config = getTestConfig(key);
    if (!measurement || !config) {
        return 0;
    }
    return measurement.testScores[config.scoreKey];
}

function filterByPeriod(history: BoxerPotentialMeasurement[], period: BoxerPotentialPeriod) {
    const now = Date.now();
    const days = period === "week" ? 7 : period === "month" ? 31 : 365;
    const from = now - days * 24 * 60 * 60 * 1000;
    return history.filter((measurement) => new Date(measurement.measuredAt).getTime() >= from);
}

function ProgressScale({
    label,
    value,
    onOpen,
}: {
    label: string
    value: number
    onOpen: () => void
}) {
    const width = Math.max(0, Math.min(100, value));

    return (
        <SectionCard style={{ padding: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 42px", gap: 12, alignItems: "center" }}>
                <div>
                    <TimelineTitleRow>
                        <TimelineTitle>{label}</TimelineTitle>
                        <TimelineTitle>{formatPotentialScore(value)}</TimelineTitle>
                    </TimelineTitleRow>
                    <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: 10 }}>
                        <div style={{ width: `${width}%`, height: "100%", borderRadius: 999, background: "#6ab3f3" }} />
                    </div>
                </div>
                <SecondaryButton
                    type="button"
                    aria-label={`Открыть ${label}`}
                    title={`Открыть ${label}`}
                    style={{ minWidth: 42, width: 42, padding: 0, fontSize: 22 }}
                    onClick={onOpen}
                >
                    +
                </SecondaryButton>
            </div>
        </SectionCard>
    );
}

function TestValueForm({
    title,
    valueLabel,
    initialMeasuredAt,
    initialValue,
    saving,
    onCancel,
    onSubmit,
}: {
    title: string
    valueLabel: string
    initialMeasuredAt: string
    initialValue: number
    saving: boolean
    onCancel: () => void
    onSubmit: (measuredAt: string, value: number) => void
}) {
    const [measuredAt, setMeasuredAt] = useState(() => toLocalDateTimeInputValue(new Date(initialMeasuredAt)));
    const [value, setValue] = useState(String(initialValue));
    const valid = Boolean(measuredAt) && value !== "" && Number(value) >= 0;

    return (
        <SectionCard>
            <SectionTitle>{title}</SectionTitle>
            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                <FieldLabel>
                    Дата и время замера
                    <NumberInput
                        as="input"
                        type="datetime-local"
                        value={measuredAt}
                        onChange={(event) => setMeasuredAt(event.target.value)}
                    />
                </FieldLabel>
                <FieldLabel>
                    {valueLabel}
                    <NumberInput
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                    />
                </FieldLabel>
            </div>
            <ButtonRow>
                <PrimaryButton type="button" disabled={!valid || saving} onClick={() => onSubmit(measuredAt, Number(value))}>
                    {saving ? "Сохраняем…" : "Сохранить"}
                </PrimaryButton>
                <SecondaryButton type="button" disabled={saving} onClick={onCancel}>
                    Отмена
                </SecondaryButton>
            </ButtonRow>
        </SectionCard>
    );
}

function TestValueChart({
    history,
    testKey,
}: {
    history: BoxerPotentialMeasurement[]
    testKey: BoxerPotentialTestKey
}) {
    const config = getTestConfig(testKey);
    if (!config || history.length === 0) {
        return <EmptyState>График появится после первого замера.</EmptyState>;
    }

    const points = [...history].sort((left, right) => new Date(left.measuredAt).getTime() - new Date(right.measuredAt).getTime());
    const maxValue = Math.max(...points.map((point) => Number(point.raw[testKey])), 1);
    const width = 520;
    const height = 160;
    const paddingX = 28;
    const paddingY = 18;
    const plotWidth = width - paddingX * 2;
    const plotHeight = height - paddingY * 2;
    const xFor = (index: number) => points.length === 1 ? width / 2 : paddingX + (plotWidth * index) / (points.length - 1);
    const yFor = (value: number) => paddingY + plotHeight - (value / maxValue) * plotHeight;
    const d = points
        .map((point, index) => `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(Number(point.raw[testKey]))}`)
        .join(" ");

    return (
        <SectionCard>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`История теста ${config.label}`} style={{ width: "100%", height: "auto", display: "block" }}>
                {[0, maxValue].map((tick) => (
                    <g key={tick}>
                        <line x1={paddingX} x2={width - paddingX} y1={yFor(tick)} y2={yFor(tick)} stroke="rgba(255,255,255,0.08)" />
                        <text x={4} y={yFor(tick) + 4} fill="#8b9bb0" fontSize="10">{formatPotentialScore(tick)}</text>
                    </g>
                ))}
                <path d={d} fill="none" stroke="#6ab3f3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((point, index) => (
                    <circle key={`${point.id}-${point.measuredAt}`} cx={xFor(index)} cy={yFor(Number(point.raw[testKey]))} r="4" fill="#6ab3f3" />
                ))}
            </svg>
            <MetaText style={{ marginTop: 8 }}>{config.unit}</MetaText>
        </SectionCard>
    );
}

export function BoxerPotentialTab({ memberId, active }: Props) {
    const {
        summary,
        leaderboard,
        loading,
        saving,
        error,
        leaderboardError,
        reload,
        submit,
        update,
    } = useBoxerPotential({ memberId, enabled: active });

    const [screen, setScreen] = useState<Screen>({ name: "overview" });
    const [period, setPeriod] = useState<BoxerPotentialPeriod>("month");
    const [editingMeasurement, setEditingMeasurement] = useState<BoxerPotentialMeasurement | null>(null);
    const [addingTest, setAddingTest] = useState(false);

    const activeTest = screen.name === "test" ? getTestConfig(screen.test) : null;
    const activeCharacteristic = screen.name === "characteristic" ? getCharacteristicConfig(screen.characteristic) : null;
    const testHistory = useMemo(() => {
        if (!summary || screen.name !== "test") {
            return [];
        }
        return filterByPeriod(summary.history, period);
    }, [period, screen, summary]);

    const latestRaw = summary?.latest?.raw ?? EMPTY_RAW_VALUES;
    const canEdit = Boolean(summary?.canCreateMeasurement);

    const saveTestValue = (testKey: BoxerPotentialTestKey, measuredAt: string, value: number) => {
        const raw = { ...latestRaw, [testKey]: value };
        void submit(measurementRequest(measuredAt, raw));
        setAddingTest(false);
    };

    const saveEditedTestValue = (measurement: BoxerPotentialMeasurement, testKey: BoxerPotentialTestKey, measuredAt: string, value: number) => {
        const raw = { ...measurement.raw, [testKey]: value };
        void update(measurement.id, measurementRequest(measuredAt, raw));
        setEditingMeasurement(null);
    };

    const backToOverview = () => {
        setScreen({ name: "overview" });
        setEditingMeasurement(null);
        setAddingTest(false);
    };

    return (
        <Section>
            <SectionHeader>
                <div>
                    <SectionTitle>Потенциал боксера</SectionTitle>
                    <SectionHint>Замеры, динамика и рейтинг по внутренней группе участника.</SectionHint>
                </div>
            </SectionHeader>

            {loading && <LoadingText>Загружаем потенциал…</LoadingText>}
            {error && (
                <>
                    <ErrorBanner>{error}</ErrorBanner>
                    <InlineNotice role="button" tabIndex={0} onClick={() => void reload()}>
                        Повторить загрузку
                    </InlineNotice>
                </>
            )}

            {!loading && summary && screen.name === "overview" && (
                <>
                    {summary.latest ? (
                        <SectionCard>
                            <StatGrid>
                                <StatCard>
                                    <StatLabel>Потенциал боксера</StatLabel>
                                    <StatValue>{formatPotentialScore(summary.latest.potentialScore)}</StatValue>
                                    <MetaText>{formatPotentialDate(summary.latest.measuredAt)} · {summary.latest.normGroupLabel}</MetaText>
                                </StatCard>
                                <StatCard>
                                    <StatLabel>Последний замер</StatLabel>
                                    <StatValue>{formatPotentialDate(summary.latest.measuredAt)}</StatValue>
                                    <MetaText>тренер: {summary.latest.updatedByName ?? summary.latest.createdByName ?? "—"}</MetaText>
                                </StatCard>
                            </StatGrid>
                        </SectionCard>
                    ) : (
                        <EmptyState>Замеров потенциала пока нет.</EmptyState>
                    )}

                    <Section>
                        <SectionTitle>Шкалы прогресса</SectionTitle>
                        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                            {BOXER_POTENTIAL_CHARACTERISTICS.map((characteristic) => (
                                <ProgressScale
                                    key={characteristic.key}
                                    label={characteristic.label}
                                    value={characteristicScore(summary.latest, characteristic.key)}
                                    onOpen={() => setScreen({ name: "characteristic", characteristic: characteristic.key })}
                                />
                            ))}
                        </div>
                    </Section>

                    <Section>
                        {summary.canCreateMeasurement && <BoxerPotentialForm saving={saving} onSubmit={submit} />}
                        {!summary.canCreateMeasurement && summary.createBlockedReason && (
                            <InlineNotice>{summary.createBlockedReason}</InlineNotice>
                        )}
                    </Section>

                    <Section>
                        <SectionTitle>Динамика</SectionTitle>
                        <BoxerPotentialChart points={summary.chart} />
                    </Section>

                    <Section>
                        <SectionTitle>История замеров</SectionTitle>
                        {summary.history.length === 0 ? (
                            <EmptyState>История появится после первого сохраненного замера.</EmptyState>
                        ) : (
                            <TimelineList>
                                {summary.history.map((measurement) => (
                                    <TimelineItem key={measurement.id}>
                                        <TimelineTitleRow>
                                            <TimelineTitle>{formatPotentialDate(measurement.measuredAt)}</TimelineTitle>
                                            <TimelineTitle>{formatPotentialScore(measurement.potentialScore)}</TimelineTitle>
                                        </TimelineTitleRow>
                                        <TimelineMeta>{measurement.normGroupLabel} · тренер: {measurement.updatedByName ?? measurement.createdByName ?? "—"}</TimelineMeta>
                                    </TimelineItem>
                                ))}
                            </TimelineList>
                        )}
                    </Section>

                    <Section>
                        <SectionTitle>Рейтинг в группе{summary.latest ? `: ${summary.latest.normGroupLabel}` : ""}</SectionTitle>
                        {!summary.latest && <EmptyState>Рейтинг появится после первого замера.</EmptyState>}
                        {summary.latest && leaderboardError && <InlineNotice>{leaderboardError}</InlineNotice>}
                        {summary.latest && leaderboard && leaderboard.items.length === 0 && <EmptyState>В этой группе пока нет рейтинга.</EmptyState>}
                        {summary.latest && leaderboard && leaderboard.items.length > 0 && (
                            <TimelineList>
                                {leaderboard.items.map((item) => (
                                    <TimelineItem key={item.memberId}>
                                        <TimelineTitleRow>
                                            <TimelineTitle>{item.place}. {item.nickname ?? "Участник"}</TimelineTitle>
                                            <TimelineTitle>{formatPotentialScore(item.potentialScore)}</TimelineTitle>
                                        </TimelineTitleRow>
                                        <TimelineMeta>{formatPotentialDate(item.measuredAt)}</TimelineMeta>
                                    </TimelineItem>
                                ))}
                            </TimelineList>
                        )}
                    </Section>
                </>
            )}

            {!loading && summary && screen.name === "characteristic" && activeCharacteristic && (
                <>
                    <ButtonRow>
                        <SecondaryButton type="button" onClick={backToOverview}>Назад</SecondaryButton>
                    </ButtonRow>
                    <SectionCard>
                        <TimelineTitleRow>
                            <TimelineTitle>{activeCharacteristic.label}</TimelineTitle>
                            <TimelineTitle>{formatPotentialScore(characteristicScore(summary.latest, activeCharacteristic.key))}</TimelineTitle>
                        </TimelineTitleRow>
                        <MetaText style={{ marginTop: 8 }}>{activeCharacteristic.description}</MetaText>
                    </SectionCard>
                    <Section>
                        <SectionTitle>Тесты характеристики</SectionTitle>
                        <TimelineList style={{ marginTop: 12 }}>
                            {activeCharacteristic.tests.map((testKey) => {
                                const test = getTestConfig(testKey);
                                if (!test) {
                                    return null;
                                }
                                return (
                                    <TimelineItem key={test.key}>
                                        <TimelineTitleRow>
                                            <TimelineTitle>{test.label}</TimelineTitle>
                                            <TimelineTitle>{formatPotentialScore(testScore(summary.latest, test.key))}</TimelineTitle>
                                        </TimelineTitleRow>
                                        <TimelineMeta>{test.normLabel}</TimelineMeta>
                                        <ButtonRow>
                                            <PrimaryButton type="button" onClick={() => setScreen({ name: "test", test: test.key })}>
                                                Открыть тест
                                            </PrimaryButton>
                                        </ButtonRow>
                                    </TimelineItem>
                                );
                            })}
                        </TimelineList>
                    </Section>
                </>
            )}

            {!loading && summary && screen.name === "test" && activeTest && (
                <>
                    <ButtonRow>
                        <SecondaryButton type="button" onClick={() => setScreen({ name: "characteristic", characteristic: activeTest.characteristic })}>
                            Назад
                        </SecondaryButton>
                    </ButtonRow>
                    <SectionCard>
                        <TimelineTitleRow>
                            <TimelineTitle>{activeTest.label}</TimelineTitle>
                            <TimelineTitle>{formatPotentialScore(testScore(summary.latest, activeTest.key))}</TimelineTitle>
                        </TimelineTitleRow>
                        <MetaText style={{ marginTop: 8 }}>{activeTest.description}</MetaText>
                        <MetaText style={{ marginTop: 4 }}>{activeTest.normLabel}</MetaText>
                    </SectionCard>

                    <Section>
                        <SectionTitle>Период</SectionTitle>
                        <ButtonRow>
                            {(Object.keys(PERIOD_LABELS) as BoxerPotentialPeriod[]).map((item) => (
                                <SecondaryButton
                                    key={item}
                                    type="button"
                                    style={{ minWidth: 88, borderColor: period === item ? "#6ab3f3" : undefined }}
                                    onClick={() => setPeriod(item)}
                                >
                                    {PERIOD_LABELS[item]}
                                </SecondaryButton>
                            ))}
                        </ButtonRow>
                    </Section>

                    <Section>
                        <SectionTitle>График истории</SectionTitle>
                        <TestValueChart history={testHistory} testKey={activeTest.key} />
                    </Section>

                    <Section>
                        <SectionHeader>
                            <div>
                                <SectionTitle>История по датам</SectionTitle>
                                <SectionHint>Открытие строки позволяет исправить значение замера.</SectionHint>
                            </div>
                        </SectionHeader>
                        {testHistory.length === 0 ? (
                            <EmptyState>За выбранный период замеров нет.</EmptyState>
                        ) : (
                            <TimelineList>
                                {testHistory.map((measurement) => (
                                    <TimelineItem key={measurement.id}>
                                        <TimelineTitleRow>
                                            <TimelineTitle>{formatPotentialDate(measurement.measuredAt)}</TimelineTitle>
                                            <TimelineTitle>{formatPotentialScore(Number(measurement.raw[activeTest.key]))} {activeTest.unit}</TimelineTitle>
                                        </TimelineTitleRow>
                                        <KeyValueList style={{ marginTop: 10 }}>
                                            <KeyValueRow><span>Score</span><span>{formatPotentialScore(testScore(measurement, activeTest.key))}</span></KeyValueRow>
                                            <KeyValueRow><span>Потенциал</span><span>{formatPotentialScore(measurement.potentialScore)}</span></KeyValueRow>
                                        </KeyValueList>
                                        {canEdit && (
                                            <ButtonRow>
                                                <SecondaryButton
                                                    type="button"
                                                    onClick={() => {
                                                        setAddingTest(false);
                                                        setEditingMeasurement(measurement);
                                                    }}
                                                >
                                                    Редактировать
                                                </SecondaryButton>
                                            </ButtonRow>
                                        )}
                                    </TimelineItem>
                                ))}
                            </TimelineList>
                        )}
                    </Section>

                    {canEdit && (
                        <Section>
                            {!addingTest && (
                                <PrimaryButton type="button" onClick={() => setAddingTest(true)}>
                                    Добавить значение
                                </PrimaryButton>
                            )}
                            {addingTest && (
                                <TestValueForm
                                    title="Новый замер теста"
                                    valueLabel={`${activeTest.shortLabel}, ${activeTest.unit}`}
                                    initialMeasuredAt={new Date().toISOString()}
                                    initialValue={Number(latestRaw[activeTest.key] ?? 0)}
                                    saving={saving}
                                    onCancel={() => setAddingTest(false)}
                                    onSubmit={(measuredAt, value) => saveTestValue(activeTest.key, measuredAt, value)}
                                />
                            )}
                            {editingMeasurement && (
                                <div style={{ marginTop: 12 }}>
                                    <TestValueForm
                                        key={editingMeasurement.id}
                                        title="Редактирование замера"
                                        valueLabel={`${activeTest.shortLabel}, ${activeTest.unit}`}
                                        initialMeasuredAt={editingMeasurement.measuredAt}
                                        initialValue={Number(editingMeasurement.raw[activeTest.key])}
                                        saving={saving}
                                        onCancel={() => setEditingMeasurement(null)}
                                        onSubmit={(measuredAt, value) => saveEditedTestValue(editingMeasurement, activeTest.key, measuredAt, value)}
                                    />
                                </div>
                            )}
                        </Section>
                    )}
                </>
            )}
        </Section>
    );
}
