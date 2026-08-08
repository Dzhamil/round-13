import { http } from "./http";

export type LoyaltyPointSourceType =
    | "TRAINING_VISIT"
    | "TRAINING_STREAK_BONUS"
    | "TRAINING_MONTHLY_MILESTONE"
    | "CLUB_EVENT_ATTENDANCE"
    | "RECRUITMENT"
    | "INITIATION"
    | "FITNESS_NORM_IMPROVEMENT"
    | "MONTHLY_COMPLEX_PLACEMENT"
    | "CLAN_WAR_PLACEMENT"
    | "PHYSICAL_PREPARATION_CHAMPIONSHIP"
    | "BOXING_MATCH"
    | "MANUAL_ADJUSTMENT"
    | "CORRECTION"
    | "REVERSAL"
    | "MIGRATION_IMPORT";

export type LoyaltyRank = {
    code: string;
    name: string;
    minPoints: number;
    major: boolean;
};

export type LoyaltyAchievement = {
    code: string;
    name: string;
    description: string | null;
    kind: string;
    thresholdPoints: number | null;
};

export type LoyaltySummary = {
    totalPoints: number;
    positivePoints: number;
    negativePoints: number;
    currentRank: LoyaltyRank | null;
    nextRank: LoyaltyRank | null;
    pointsToNextRank: number | null;
    progressPercent: number;
    currentAchievement: LoyaltyAchievement | null;
};

export type LoyaltyPointHistoryItem = {
    id: string;
    sourceType: LoyaltyPointSourceType;
    pointsDelta: number;
    eventDate: string;
    sourceEntityId: string | null;
    sourceEntityType: string | null;
    recordedByUserId: string | null;
    reason: string;
    ruleCode: string | null;
    ruleVersion: number | null;
    metadata: Record<string, unknown> | null;
    correctionOfEntryId: string | null;
    revokedEntryId: string | null;
};

export type LoyaltyLeaderboardItem = {
    place: number;
    memberId: string;
    nickname: string;
    totalPoints: number;
    rank: LoyaltyRank | null;
};

export type LoyaltyLeaderboard = {
    items: LoyaltyLeaderboardItem[];
};

export type ManualPointAwardRequest = {
    memberId: string;
    sourceType: LoyaltyPointSourceType;
    ruleCode?: string | null;
    pointsDelta?: number | null;
    eventDate?: string | null;
    sourceEntityId?: string | null;
    sourceEntityType?: string | null;
    reason: string;
    metadata?: Record<string, unknown> | null;
};

export type PointCorrectionRequest = {
    pointsDelta: number;
    eventDate?: string | null;
    reason: string;
    metadata?: Record<string, unknown> | null;
};

export type PointRevokeRequest = {
    eventDate?: string | null;
    reason: string;
    metadata?: Record<string, unknown> | null;
};

export function getMyLoyaltySummary(): Promise<LoyaltySummary> {
    return http.get<LoyaltySummary>("/account/loyalty/summary").then((response) => response.data);
}

export function getMyLoyaltyHistory(limit = 5): Promise<LoyaltyPointHistoryItem[]> {
    return http.get<LoyaltyPointHistoryItem[]>("/account/loyalty/history", {
        params: { limit },
    }).then((response) => response.data);
}

export function getLoyaltyLeaderboard(limit = 20): Promise<LoyaltyLeaderboard> {
    return http.get<LoyaltyLeaderboard>("/loyalty/leaderboard", {
        params: { limit },
    }).then((response) => response.data);
}

export function getAdminMemberLoyaltyHistory(memberId: string, limit = 20): Promise<LoyaltyPointHistoryItem[]> {
    return http.get<LoyaltyPointHistoryItem[]>(`/admin/loyalty/members/${memberId}/history`, {
        params: { limit },
    }).then((response) => response.data);
}

export function awardAdminLoyaltyPoints(request: ManualPointAwardRequest): Promise<LoyaltyPointHistoryItem> {
    return http.post<LoyaltyPointHistoryItem>("/admin/loyalty/points/manual", request).then((response) => response.data);
}

export function correctAdminLoyaltyPoints(
    entryId: string,
    request: PointCorrectionRequest,
): Promise<LoyaltyPointHistoryItem> {
    return http
        .post<LoyaltyPointHistoryItem>(`/admin/loyalty/points/${entryId}/corrections`, request)
        .then((response) => response.data);
}

export function revokeAdminLoyaltyPoints(entryId: string, request: PointRevokeRequest): Promise<LoyaltyPointHistoryItem> {
    return http
        .post<LoyaltyPointHistoryItem>(`/admin/loyalty/points/${entryId}/revoke`, request)
        .then((response) => response.data);
}

export function getTrainerStudentLoyaltyHistory(studentId: string, limit = 20): Promise<LoyaltyPointHistoryItem[]> {
    return http.get<LoyaltyPointHistoryItem[]>(`/trainer/students/${studentId}/loyalty/history`, {
        params: { limit },
    }).then((response) => response.data);
}

export function awardTrainerStudentLoyaltyPoints(
    studentId: string,
    request: ManualPointAwardRequest,
): Promise<LoyaltyPointHistoryItem> {
    return http
        .post<LoyaltyPointHistoryItem>(`/trainer/students/${studentId}/loyalty/points/manual`, request)
        .then((response) => response.data);
}
