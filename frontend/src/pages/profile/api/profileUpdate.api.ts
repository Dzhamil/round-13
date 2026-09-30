// frontend/src/pages/profile/api/profileUpdate.api.ts
import { http } from "../../../shared/api/http";
import type { MeResponse } from "../../../shared/api/account.api";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type UpdateMyProfileRequest = {
    surname?: string | null;
    firstName?: string | null;
    patronymic?: string | null;
    nickname?: string | null;
    phone?: string | null;
    phoneHidden?: boolean | null;
    gender?: Gender | null;
    aboutMe?: string | null;

    birthDate?: string | null; // YYYY-MM-DD (опционально)

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

export async function uploadMyProfileAvatar(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await http.post<{ avatarUrl: string }>("/account/profile/avatar", form);
    return data.avatarUrl;
}
