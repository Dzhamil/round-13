import { MEMBER_DETAILS_TEXT } from "../../../model/members.constants";
import { buildBalanceHistoryTitle, formatDateTime, getTrainingStatusLabel } from "../../../model/members.helpers";
import type { TrainerStudentHistory } from "../../../model/members.types";
import {
    ActionButton,
    DeltaBadge,
    EmptyState,
    LoadingText,
    Section,
    SectionHeader,
    SectionHint,
    SectionTitle,
    StatusChip,
    TimelineItem,
    TimelineList,
    TimelineMeta,
    TimelineTitle,
    TimelineTitleRow,
    TrainingHistoryHeader,
    TrainingHistoryMetaRow,
} from "./memberDetailsModal.styles";

type Props = {
    history: TrainerStudentHistory | null
    loading: boolean
    error: string | null
    onRetry: () => void
}

export function StudentHistoryTab({ history, loading, error, onRetry }: Props) {
    if (loading) {
        return <LoadingText>Загружаем историю ученика…</LoadingText>;
    }

    if (error) {
        return (
            <Section>
                <EmptyState>{error}</EmptyState>
                <ActionButton type="button" style={{ marginTop: 12 }} onClick={onRetry}>
                    {MEMBER_DETAILS_TEXT.retry}
                </ActionButton>
            </Section>
        );
    }

    if (!history || (history.trainings.length === 0 && history.balanceChanges.length === 0)) {
        return (
            <Section>
                <EmptyState>{MEMBER_DETAILS_TEXT.historyEmpty}</EmptyState>
            </Section>
        );
    }

    return (
        <>
            <Section>
                <SectionHeader>
                    <div>
                        <SectionTitle>{MEMBER_DETAILS_TEXT.trainingHistoryTitle}</SectionTitle>
                        <SectionHint>Все зафиксированные тренировки ученика с вами.</SectionHint>
                    </div>
                </SectionHeader>

                {history.trainings.length === 0 ? (
                    <EmptyState>{MEMBER_DETAILS_TEXT.trainingsEmpty}</EmptyState>
                ) : (
                    <TimelineList>
                        {history.trainings.map((item) => (
                            <TimelineItem key={item.id}>
                                <TrainingHistoryHeader>{item.title}</TrainingHistoryHeader>
                                <TrainingHistoryMetaRow>
                                    <TimelineMeta style={{ marginTop: 0 }}>{formatDateTime(item.startTime)}</TimelineMeta>
                                    <StatusChip>{getTrainingStatusLabel(item.participantStatus)}</StatusChip>
                                </TrainingHistoryMetaRow>
                                {item.location ? <TimelineMeta>Локация: {item.location}</TimelineMeta> : null}
                            </TimelineItem>
                        ))}
                    </TimelineList>
                )}
            </Section>

            <Section>
                <SectionHeader>
                    <div>
                        <SectionTitle>{MEMBER_DETAILS_TEXT.allHistory}</SectionTitle>
                        <SectionHint>Все изменения баланса тренировок по этому ученику.</SectionHint>
                    </div>
                </SectionHeader>

                {history.balanceChanges.length === 0 ? (
                    <EmptyState>{MEMBER_DETAILS_TEXT.balanceHistoryEmpty}</EmptyState>
                ) : (
                    <TimelineList>
                        {history.balanceChanges.map((item) => (
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
        </>
    );
}
