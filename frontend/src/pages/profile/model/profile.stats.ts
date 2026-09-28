import type { MyStatsResponse } from "../../../shared/api/stats.api";

export type ProfileStatsView = {
    periodLabel: string;
    trainingsVisited: number;
    trainingsMissed: number;
    sparringsTotal: number;
    wins: number;
    defeats: number;
};

export function buildEmptyUserStats(): ProfileStatsView {
    return {
        periodLabel: "Общая статистика",
        trainingsVisited: 0,
        trainingsMissed: 0,
        sparringsTotal: 0,
        wins: 0,
        defeats: 0,
    };
}

export function mapMyStatsToUserStats(stats: MyStatsResponse): ProfileStatsView {
    return {
        periodLabel: "Общая статистика",
        trainingsVisited: stats.trainingsAttendedCount ?? 0,
        trainingsMissed: stats.trainingsMissedCount ?? 0,
        sparringsTotal: stats.sparringsCount ?? 0,
        wins: stats.winsCount ?? 0,
        defeats: stats.defeatsCount ?? 0,
    };
}
