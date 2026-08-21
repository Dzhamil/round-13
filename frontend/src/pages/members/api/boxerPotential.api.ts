import { http } from "../../../shared/api/http";
import type {
    BoxerPotentialLeaderboard,
    BoxerPotentialMeasurement,
    BoxerPotentialMeasurementRequest,
    BoxerPotentialNormGroup,
    BoxerPotentialSummary,
} from "../model/boxerPotential.types";

export async function getBoxerPotentialSummary(memberId: string): Promise<BoxerPotentialSummary> {
    const res = await http.get<BoxerPotentialSummary>(`/members/${memberId}/boxer-potential/summary`);
    return res.data;
}

export async function createBoxerPotentialMeasurement(
    memberId: string,
    request: BoxerPotentialMeasurementRequest,
): Promise<BoxerPotentialMeasurement> {
    const res = await http.post<BoxerPotentialMeasurement>(`/members/${memberId}/boxer-potential/measurements`, request);
    return res.data;
}

export async function updateBoxerPotentialMeasurement(
    memberId: string,
    measurementId: string,
    request: BoxerPotentialMeasurementRequest,
): Promise<BoxerPotentialMeasurement> {
    const res = await http.put<BoxerPotentialMeasurement>(
        `/members/${memberId}/boxer-potential/measurements/${measurementId}`,
        request,
    );
    return res.data;
}

export async function getBoxerPotentialLeaderboard(
    normGroup: BoxerPotentialNormGroup,
    limit = 10,
): Promise<BoxerPotentialLeaderboard> {
    const res = await http.get<BoxerPotentialLeaderboard>("/members/boxer-potential/leaderboard", {
        params: { normGroup, limit },
    });
    return res.data;
}
