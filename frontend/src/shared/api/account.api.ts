// frontend/src/shared/api/account.api.ts
import { http } from "./http";

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type ProfileEntitlementType = "PERSONAL_TRAININGS" | "GROUP_TRAININGS";
export type ProfileEntitlementItem = {
    id: string;
    type: ProfileEntitlementType;
    title: string;
    subtitle?: string | null;
    usageHint?: string | null;
    remainingQuantity: number;
    expiresAt?: string | null;
};
export type MeResponse = {
    id: string;

    phone?: string | null;
    phoneHidden?: boolean;
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
    entitlements?: ProfileEntitlementItem[];
};

export function getMe(): Promise<MeResponse> {
    return http.get<MeResponse>("/account/me").then((r) => r.data);
}
