import type { MemberDetails } from "../../../model/members.types";
import { MEMBER_DETAILS_TEXT } from "../../../model/members.constants";
import {
    AboutBlock,
    Section,
    SectionHeader,
    SectionTitle,
    StatCard,
    StatGrid,
    StatLabel,
    StatValue,
} from "./memberDetailsModal.styles";

type Props = {
    details: MemberDetails
}

function buildStats(details: MemberDetails): Array<{ label: string; value: string }> {
    const stats = [
        { label: "Стаж", value: `${details.tenureMonths ?? 0} мес.` },
        { label: "Очки", value: String(details.points ?? 0) },
        { label: "Боёв", value: String(details.fightsCount ?? 0) },
        { label: "Побед", value: String(details.winsCount ?? 0) },
    ];

    if (details.roleCode !== "COACH" && details.roleCode !== "ADMIN") {
        stats.push({ label: "Посещено тренировок", value: String(details.trainingsAttendedCount ?? 0) });
    }

    if (details.remainingTrainings != null) {
        stats.push({ label: "Остаток тренировок", value: String(details.remainingTrainings) });
    }

    if (details.roleCode === "COACH") {
        stats.push({ label: "Проведено тренировок", value: String(details.trainingsConductedCount ?? 0) });
        stats.push({ label: "Учеников", value: String(details.studentsCount ?? 0) });
    }

    return stats;
}

export function MemberProfileSection({ details }: Props) {
    const stats = buildStats(details);

    return (
        <>
            <Section>
                <SectionHeader>
                    <div>
                        <SectionTitle>{MEMBER_DETAILS_TEXT.statsTitle}</SectionTitle>
                    </div>
                </SectionHeader>
                <StatGrid>
                    {stats.map((item) => (
                        <StatCard key={item.label}>
                            <StatLabel>{item.label}</StatLabel>
                            <StatValue>{item.value}</StatValue>
                        </StatCard>
                    ))}
                </StatGrid>
            </Section>

            {details.aboutMe && (
                <Section>
                    <SectionHeader>
                        <div>
                            <SectionTitle>{MEMBER_DETAILS_TEXT.aboutTitle}</SectionTitle>
                        </div>
                    </SectionHeader>
                    <AboutBlock>{details.aboutMe}</AboutBlock>
                </Section>
            )}
        </>
    );
}
