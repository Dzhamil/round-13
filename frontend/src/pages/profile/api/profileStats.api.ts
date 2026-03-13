import { getMyStats, type MyStatsResponse } from "../../../shared/api/stats.api";

export async function fetchMyStats(): Promise<MyStatsResponse> {
    return getMyStats();
}
