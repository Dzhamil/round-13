export type FighterStats = {
    periodLabel: string; // "за месяц" / "за квартал"
    trainingsVisited: number;
    sparringsTotal: number;
    wins: number;
    defeats: number;
};

export type EntitlementItem = {
    id: string;
    title: string;
    subtitle?: string;
};

export type FighterProfile = {
    id: string;
    name: string;
    avatarUrl?: string;

    ratingPlace: number | null;
    winRatePercent: number | null;

    statsMonth: FighterStats;
    statsQuarter: FighterStats;

    entitlements: EntitlementItem[];

    isSubscribed: boolean;
};
