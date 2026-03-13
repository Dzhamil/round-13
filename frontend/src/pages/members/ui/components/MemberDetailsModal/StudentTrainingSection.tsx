import { MEMBER_DETAILS_TEXT } from "../../../model/members.constants";
import { formatDateTime, getTrainingStatusLabel } from "../../../model/members.helpers";
import type { StudentTrainingActivity } from "../../../model/members.types";
import {
    EmptyState,
    SecondaryButton,
    Section,
    SectionCard,
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
    nextTraining: StudentTrainingActivity | null
    recentTrainings: StudentTrainingActivity[]
    onOpenHistory: () => void
}

export function StudentTrainingSection({ nextTraining, recentTrainings, onOpenHistory }: Props) {
    return (
        <Section>
            <SectionHeader>
                <div>
                    <SectionTitle>{MEMBER_DETAILS_TEXT.trainingsTitle}</SectionTitle>
                    <SectionHint>Быстрый срез по последним занятиям ученика именно в вашем контуре.</SectionHint>
                </div>
                <SecondaryButton type="button" onClick={onOpenHistory}>
                    {MEMBER_DETAILS_TEXT.openFullHistory}
                </SecondaryButton>
            </SectionHeader>

            <SectionCard style={{ marginBottom: 12 }}>
                <TimelineTitle>{MEMBER_DETAILS_TEXT.nextTrainingLabel}</TimelineTitle>
                <TimelineMeta style={{ marginTop: 8 }}>
                    {nextTraining
                        ? `${nextTraining.title} · ${formatDateTime(nextTraining.startTime)}`
                        : MEMBER_DETAILS_TEXT.noNextTraining}
                </TimelineMeta>
                {nextTraining?.location && (
                    <TimelineMeta>Локация: {nextTraining.location}</TimelineMeta>
                )}
            </SectionCard>

            {recentTrainings.length === 0 ? (
                <EmptyState>{MEMBER_DETAILS_TEXT.trainingsEmpty}</EmptyState>
            ) : (
                <TimelineList>
                    {recentTrainings.map((item) => (
                        <TimelineItem key={item.id}>
                            <TimelineTitleRow>
                                <div>
                                    <TimelineTitle>{item.title}</TimelineTitle>
                                    <TimelineMeta>{formatDateTime(item.startTime)}</TimelineMeta>
                                </div>
                                <TimelineTitle>{getTrainingStatusLabel(item.participantStatus)}</TimelineTitle>
                            </TimelineTitleRow>
                            {item.location && <TimelineMeta>Локация: {item.location}</TimelineMeta>}
                        </TimelineItem>
                    ))}
                </TimelineList>
            )}
        </Section>
    );
}
