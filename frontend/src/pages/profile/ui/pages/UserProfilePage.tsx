// frontend/src/pages/profile/ui/pages/UserProfilePage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { ProfileHeader } from "../components/ProfileHeader/ProfileHeader";
import { ProfileStatsBlock } from "../components/ProfileStatsBlock/ProfileStatsBlock";
import { SubscribeButton } from "../components/SubscribeButton/SubscribeButton";

import { profilePageStyles as s } from "../../styles/profilePage.styles";
import { buildEmptyUserStats } from "../../model/profile.stats";
import { fetchUserProfile, type UserProfileResponse } from "../../api/users.api";

/**
 * Публичный профиль участника (из рейтинга).
 * Только чтение.
 */
export function UserProfilePage() {
    const { id } = useParams<{ id: string }>();

    const [user, setUser] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function load() {
        if (!id) return;

        setLoading(true);
        try {
            const data = await fetchUserProfile(id);
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div style={s.root}>Загрузка профиля…</div>;
    }

    if (!user) {
        return <div style={s.root}>Профиль не найден</div>;
    }

    const stats = buildEmptyUserStats();

    return (
        <div style={s.root}>
            <ProfileHeader
                avatarUrl={user.avatarUrl ?? undefined}
                name={user.fullName ?? user.nickname ?? "Без имени"}
                gender={user.gender ?? null}
                ratingPlace={user.ratingPlace ?? null}
                winRatePercent={user.winRatePercent ?? null}
            />

            <ProfileStatsBlock {...stats} />

            <SubscribeButton
                isSubscribed={isSubscribed}
                onToggle={() => setIsSubscribed((v) => !v)}
            />
        </div>
    );
}
