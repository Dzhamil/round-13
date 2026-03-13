import { http } from "./http";

/**
 * Статистика текущего пользователя.
 * Backend: GET /api/stats/me
 */
export type MyStatsResponse = {
    ratingPlace: number | null;

    clubExperienceMonths: number;

    fightsCount: number;
    winsCount: number;
    defeatsCount: number;

    sparringsCount: number;

    trainingsAttendedCount: number;
    trainingsMissedCount: number;

    winRatePercent: number;
    knockoutRatePercent: number;
    knockdownRatePercent: number;
};

export async function getMyStats(): Promise<MyStatsResponse> {
    const { data } = await http.get<MyStatsResponse>("/stats/me");
    return data;
}
