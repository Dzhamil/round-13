// frontend/src/pages/profile/ui/pages/profilePage.types.ts
import type { Gender } from "../../../../shared/api/account.api";

export type ProfilePageMe = {
    avatarUrl?: string | null;
    fullName?: string | null;
    nickname?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    gender?: Gender | string | null;
};

export type ProfilePageStats = {
    ratingPlace: number | null;
    winRatePercent: number | null;

    trainingsAttendedCount?: number | null;
    trainingsTotalCount?: number | null;
    winsCount?: number | null;
    defeatsCount?: number | null;
};

export type ProfilePageViewProps = {
    loading: boolean;
    hasMe: boolean;

    me: ProfilePageMe | null;
    stats: ProfilePageStats;

    isEditOpen: boolean;
    onOpenEdit: () => void;
    onCloseEdit: () => void;

    onReload: () => void;
};
