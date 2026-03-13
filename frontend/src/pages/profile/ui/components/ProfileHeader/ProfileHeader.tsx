// frontend/src/pages/profile/ui/components/ProfileHeader/ProfileHeader.tsx
import { profileHeaderStyles as s } from "./profileHeader.styles";

type Gender = "MALE" | "FEMALE" | "OTHER" | string;

type ProfileHeaderProps = {
    avatarUrl?: string;
    name: string;
    gender?: Gender | null;
    ratingPlace: number | null;
    winRatePercent: number | null;
};

/**
 * Шапка профиля бойца.
 *
 * UI-компонент без бизнес-логики.
 */
export function ProfileHeader({
                                  avatarUrl,
                                  name,
                                  gender,
                                  ratingPlace,
                                  winRatePercent,
                              }: ProfileHeaderProps) {
    const genderLabel = mapGender(gender);

    return (
        <div style={s.root}>
            <div style={s.avatar(avatarUrl)} />

            <div style={{ minWidth: 0 }}>
                <div style={s.name}>{name}</div>

                {genderLabel ? (
                    <div style={s.row}>
                        Пол: <span style={s.badge}>{genderLabel}</span>
                    </div>
                ) : null}

                {ratingPlace !== null ? (
                    <div style={s.muted}>Рейтинг: #{ratingPlace}</div>
                ) : null}

                {winRatePercent !== null ? (
                    <div style={s.row}>
                        Победы: <span style={s.strong}>{winRatePercent}%</span>
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
    if (g === "OTHER") return "??";
    return null;
}
