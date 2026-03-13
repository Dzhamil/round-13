import { MEMBER_DETAILS_TEXT } from "../../../model/members.constants";
import {
    buildOperationalStatusDescription,
    formatDateTime,
    getOperationalStatusLabel,
    getOperationalStatusTone,
} from "../../../model/members.helpers";
import type { StudentOperationalStatus, StudentTrainingActivity } from "../../../model/members.types";
import {
    KeyValueList,
    KeyValueRow,
    Section,
    SectionCard,
    SectionHeader,
    SectionTitle,
    StatusBadge,
    StatusDescription,
    StatusHeader,
} from "./memberDetailsModal.styles";

type Props = {
    status: StudentOperationalStatus | null
    remainingTrainings: number | null
    nextTraining: StudentTrainingActivity | null
}

export function StudentStatusSection({ status, remainingTrainings, nextTraining }: Props) {
    const tone = getOperationalStatusTone(status?.code);

    return (
        <Section>
            <SectionHeader>
                <div>
                    <SectionTitle>{MEMBER_DETAILS_TEXT.coachCardTitle}</SectionTitle>
                </div>
            </SectionHeader>

            <SectionCard>
                <StatusHeader>
                    <StatusBadge $tone={tone}>
                        {getOperationalStatusLabel(status?.code)}
                    </StatusBadge>
                </StatusHeader>

                <StatusDescription>
                    {buildOperationalStatusDescription(status, remainingTrainings, nextTraining)}
                </StatusDescription>

                <KeyValueList style={{ marginTop: 14 }}>
                    <KeyValueRow>
                        <span>Остаток тренировок</span>
                        <span>{remainingTrainings ?? 0}</span>
                    </KeyValueRow>
                    <KeyValueRow>
                        <span>{MEMBER_DETAILS_TEXT.nextTrainingLabel}</span>
                        <span>
                            {nextTraining ? formatDateTime(nextTraining.startTime) : MEMBER_DETAILS_TEXT.noNextTraining}
                        </span>
                    </KeyValueRow>
                    <KeyValueRow>
                        <span>Последнее посещение</span>
                        <span>{formatDateTime(status?.lastAttendedAt ?? null)}</span>
                    </KeyValueRow>
                </KeyValueList>
            </SectionCard>
        </Section>
    );
}
