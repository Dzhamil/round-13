// frontend/src/pages/profile/ui/components/ProfileHeader/ProfileHeader.tsx
import type { ReactNode } from "react";

import { profileHeaderStyles as s } from "./profileHeader.styles";

type Gender = "MALE" | "FEMALE" | "OTHER" | string;

type ProfileHeaderProps = {
    avatarUrl?: string;
    name: string;
    gender?: Gender | null;
    ratingPlace: number | null;
    winRatePercent: number | null;
    infoItems?: ProfileHeaderInfoItem[];
};

export type ProfileHeaderInfoItem = {
    label: string;
    value: ReactNode;
};

export function ProfileHeader({
                                  avatarUrl,
                                  name,
                                  gender,
                                  ratingPlace,
                                  winRatePercent,
                                  infoItems = [],
                              }: ProfileHeaderProps) {
    const genderLabel = mapGender(gender);
    const compactItems: ProfileHeaderInfoItem[] = [
        ...(genderLabel ? [{ label: "Пол", value: genderLabel }] : []),
        ...(ratingPlace !== null ? [{ label: "Рейтинг", value: `#${ratingPlace}` }] : []),
        ...(winRatePercent !== null ? [{ label: "Победы", value: `${winRatePercent}%` }] : []),
        ...infoItems,
    ];

    return (
        <div style={s.root} data-testid="profile-compact-header">
            <div style={s.avatar(avatarUrl)} data-testid="profile-compact-avatar" />

            <div style={s.content} data-testid="profile-compact-info">
                <div style={s.name}>{name}</div>

                {compactItems.length > 0 ? (
                    <div style={s.infoList}>
                        {compactItems.map((item) => (
                            <div style={s.infoRow} key={item.label}>
                                <span style={s.infoLabel}>{item.label}</span>
                                <span style={s.infoValue}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function mapGender(gender?: Gender | null): string | null {
    if (!gender) return null;

    const g = String(gender).toUpperCase();
    if (g === "MALE") return "М";
    if (g === "FEMALE") return "Ж";
    if (g === "OTHER") return "Другое";
    return null;
}
