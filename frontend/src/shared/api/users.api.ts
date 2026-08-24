import { http } from "./http";

/**
 * Публичный профиль участника (для перехода из рейтинга).
 * GET /api/users/{id}
 */
export type UserProfileResponse = {
    id: string;

    nickname?: string | null;
    fullName?: string | null;
    avatarUrl?: string | null;
    phone?: string | null;
    phoneHidden?: boolean | null;
    birthDate?: string | null;

    gender?: "MALE" | "FEMALE" | "OTHER" | string | null;

    ratingPlace?: number | null;
    winRatePercent?: number | null;

    // позже расширим статистикой/подпиской/кланом и т.д.
};

export function getUserProfile(userId: string): Promise<UserProfileResponse> {
    return http.get<UserProfileResponse>(`/users/${userId}`).then((r) => r.data);
}
