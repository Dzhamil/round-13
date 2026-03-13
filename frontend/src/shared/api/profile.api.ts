// frontend/src/shared/api/profile.api.ts
import { http } from "./http";
import type { MeResponse } from "./account.api";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type UpdateProfileRequest = {
    // новое
    nickname?: string | null;
    phone?: string | null;
    gender?: Gender | null;

    fullName?: string | null;
    birthDate?: string | null; // YYYY-MM-DD
    avatarUrl?: string | null;

    clan?: string | null;
    debutDate?: string | null;
};

export type UpdateAboutMeRequest = {
    aboutMe: string | null;
};

export function completeProfile(request: UpdateProfileRequest): Promise<MeResponse> {
    return http.post<MeResponse>("/account/complete-profile", request).then((r) => r.data);
}

export function updateAboutMe(request: UpdateAboutMeRequest): Promise<MeResponse> {
    return http.patch<MeResponse>("/account/profile/about", request).then((r) => r.data);
}
