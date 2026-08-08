import type { LoyaltyPointHistoryItem, LoyaltyPointSourceType, LoyaltySummary } from "./loyalty.api";

const SOURCE_LABELS: Record<LoyaltyPointSourceType, string> = {
    TRAINING_VISIT: "Тренировка",
    TRAINING_STREAK_BONUS: "Серия тренировок",
    TRAINING_MONTHLY_MILESTONE: "Месячная активность",
    CLUB_EVENT_ATTENDANCE: "Событие клуба",
    RECRUITMENT: "Привёл участника",
    INITIATION: "Посвящение",
    FITNESS_NORM_IMPROVEMENT: "Физическая динамика",
    MONTHLY_COMPLEX_PLACEMENT: "Месячный комплекс",
    CLAN_WAR_PLACEMENT: "Война кланов",
    PHYSICAL_PREPARATION_CHAMPIONSHIP: "ОФП чемпионат",
    BOXING_MATCH: "Боксёрский бой",
    MANUAL_ADJUSTMENT: "Ручная запись",
    CORRECTION: "Коррекция",
    REVERSAL: "Отзыв записи",
    MIGRATION_IMPORT: "Импорт",
};

export function getLoyaltySourceLabel(sourceType: LoyaltyPointSourceType | null | undefined): string {
    if (!sourceType) {
        return "Начисление";
    }

    return SOURCE_LABELS[sourceType] ?? sourceType;
}

export function formatLoyaltyDelta(pointsDelta: number): string {
    return pointsDelta > 0 ? `+${pointsDelta}` : String(pointsDelta);
}

export function formatLoyaltyDate(value: string | null | undefined): string {
    if (!value) {
        return "";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsed);
}

export function getLoyaltyRankName(summary: LoyaltySummary | null): string {
    return summary?.currentRank?.name ?? "Ранг скоро появится";
}

export function getLoyaltyProgressLabel(summary: LoyaltySummary | null): string {
    if (!summary) {
        return "";
    }

    if (summary.nextRank && summary.pointsToNextRank != null) {
        return `${summary.pointsToNextRank} до ${summary.nextRank.name}`;
    }

    if (summary.currentAchievement?.name) {
        return summary.currentAchievement.name;
    }

    return "Прогресс считается по истории начислений";
}

export function isCorrectionEntry(item: LoyaltyPointHistoryItem): boolean {
    return Boolean(item.correctionOfEntryId || item.revokedEntryId || item.sourceType === "CORRECTION" || item.sourceType === "REVERSAL");
}
