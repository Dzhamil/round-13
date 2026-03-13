// frontend/src/pages/profile/ui/pages/ProfilePage.container.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchMe } from "../../api/profile.api";
import { fetchMyStats } from "../../api/profileStats.api";
import { isProfileComplete } from "../../lib/profile.completeness";
import { buildEmptyUserStats, mapMyStatsToUserStats } from "../../model/profile.stats";

import { ProfilePageView } from "./ProfilePage.view";

export function ProfilePageContainer() {
    const navigate = useNavigate();

    const [me, setMe] = useState<any | null>(null);
    const [myStats, setMyStats] = useState<any | null>(null);

    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState<string | null>(null);

    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function load() {
        setLoading(true);
        setErrorText(null);

        try {
            const meData = await fetchMe();
            setMe(meData);

            if (!isProfileComplete(meData as any)) {
                navigate("/profile/complete", { replace: true });
                return;
            }

            try {
                const statsData = await fetchMyStats();
                setMyStats(statsData);
            } catch {
                setMyStats(null);
                setErrorText("Не удалось загрузить статистику профиля");
            }
        } catch {
            setMe(null);
            setMyStats(null);
            setErrorText("Не удалось загрузить профиль");
        } finally {
            setLoading(false);
        }
    }

    const mappedStats = useMemo(() => {
        return myStats ? mapMyStatsToUserStats(myStats) : buildEmptyUserStats();
    }, [myStats]);

    return (
        <ProfilePageView
            loading={loading}
            errorText={errorText}
            me={me}
            mappedStats={mappedStats}
            isEditOpen={isEditOpen}
            onOpenEdit={() => setIsEditOpen(true)}
            onCloseEdit={() => setIsEditOpen(false)}
            onReload={() => void load()}
        />
    );
}
