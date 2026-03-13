// frontend/src/shared/api/account.api.ts
import { http } from "./http";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type MeResponse = {
    id: string;

    phone?: string | null;
    nickname?: string | null;

    role: string;
    status: string;

    telegramUserId?: number | null;

    fullName?: string | null;
    birthDate?: string | null;
    avatarUrl?: string | null;

    gender?: Gender | null;

    profileCompleted?: boolean;
    debutDate?: string | null;
    clan?: string | null;

    aboutMe?: string | null;
    phoneVerifiedByStaff?: boolean;
};

export function getMe(): Promise<MeResponse> {
    return http.get<MeResponse>("/account/me").then((r) => r.data);
}
