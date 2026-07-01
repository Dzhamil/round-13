import { formatPotentialDate, formatPotentialScore } from "../../../model/boxerPotential.helpers";
import { useBoxerPotential } from "../../../model/useBoxerPotential";
import { BoxerPotentialChart } from "./BoxerPotentialChart";
import { BoxerPotentialForm } from "./BoxerPotentialForm";
import {
    EmptyState,
    ErrorBanner,
    InlineNotice,
    KeyValueList,
    KeyValueRow,
    LoadingText,
    MetaText,
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

type Props = {
    memberId: string
    active: boolean
}

export function BoxerPotentialTab({ memberId, active }: Props) {
    const {
        summary,
        leaderboard,
        loading,
        saving,
        error,
        reload,
        submit,
    } = useBoxerPotential({ memberId, enabled: active });

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

            {!loading && summary && (
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
                                    <StatLabel>Сила</StatLabel>
                                    <StatValue>{formatPotentialScore(summary.latest.characteristicScores.strength)}</StatValue>
                                </StatCard>
                                <StatCard>
                                    <StatLabel>Выносливость</StatLabel>
                                    <StatValue>{formatPotentialScore(summary.latest.characteristicScores.endurance)}</StatValue>
                                </StatCard>
                                <StatCard>
                                    <StatLabel>Скорость</StatLabel>
                                    <StatValue>{formatPotentialScore(summary.latest.characteristicScores.speed)}</StatValue>
                                </StatCard>
                                <StatCard>
                                    <StatLabel>Ловкость</StatLabel>
                                    <StatValue>{formatPotentialScore(summary.latest.characteristicScores.agility)}</StatValue>
                                </StatCard>
                            </StatGrid>
                        </SectionCard>
                    ) : (
                        <EmptyState>Замеров потенциала пока нет.</EmptyState>
                    )}

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
                                        <TimelineMeta>{measurement.normGroupLabel} · тренер: {measurement.createdByName ?? "—"}</TimelineMeta>
                                        <KeyValueList style={{ marginTop: 10 }}>
                                            <KeyValueRow><span>Сила</span><span>{formatPotentialScore(measurement.characteristicScores.strength)}</span></KeyValueRow>
                                            <KeyValueRow><span>Выносливость</span><span>{formatPotentialScore(measurement.characteristicScores.endurance)}</span></KeyValueRow>
                                            <KeyValueRow><span>Скорость</span><span>{formatPotentialScore(measurement.characteristicScores.speed)}</span></KeyValueRow>
                                            <KeyValueRow><span>Ловкость</span><span>{formatPotentialScore(measurement.characteristicScores.agility)}</span></KeyValueRow>
                                        </KeyValueList>
                                    </TimelineItem>
                                ))}
                            </TimelineList>
                        )}
                    </Section>

                    <Section>
                        <SectionTitle>Рейтинг в группе{summary.latest ? `: ${summary.latest.normGroupLabel}` : ""}</SectionTitle>
                        {!summary.latest && <EmptyState>Рейтинг появится после первого замера.</EmptyState>}
                        {summary.latest && leaderboard && leaderboard.items.length === 0 && (
                            <EmptyState>В этой группе пока нет рейтинга.</EmptyState>
                        )}
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
        </Section>
    );
}
