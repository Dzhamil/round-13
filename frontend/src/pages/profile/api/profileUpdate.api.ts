// frontend/src/pages/profile/api/profileUpdate.api.ts
import { http } from "../../../shared/api/http";
import type { MeResponse } from "../../../shared/api/account.api";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type UpdateMyProfileRequest = {
    nickname?: string | null;
    phone?: string | null;
    gender?: Gender | null;

    birthDate?: string | null; // YYYY-MM-DD (опционально)
    avatarUrl?: string | null;

    fullName?: string | null;
    clan?: string | null;
    debutDate?: string | null;
};

/**
 * PATCH /api/account/profile
 */
export async function updateMyProfile(
    request: UpdateMyProfileRequest,
): Promise<MeResponse> {
    const { data } = await http.patch<MeResponse>("/account/profile", request);
    return data;
}
