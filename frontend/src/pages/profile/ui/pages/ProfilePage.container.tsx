// frontend/src/pages/profile/ui/pages/ProfilePage.container.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteMyAccount, type MeResponse } from "../../../../shared/api/account.api";
import { clearAuthTokens } from "../../../../shared/lib/tokens";

import { fetchMe } from "../../api/profile.api";
import { fetchMyStats } from "../../api/profileStats.api";
import { isProfileComplete } from "../../lib/profile.completeness";
import { buildEmptyUserStats, mapMyStatsToUserStats } from "../../model/profile.stats";

import { ProfilePageView } from "./ProfilePage.view";

export function ProfilePageContainer() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [me, setMe] = useState<MeResponse | null>(null);
    const [myStats, setMyStats] = useState<any | null>(null);

    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState<string | null>(null);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [deleteConfirmed, setDeleteConfirmed] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (searchParams.get("passwordReset") !== "1") return;
        setIsPasswordOpen(true);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("passwordReset");
        setSearchParams(nextParams, { replace: true });
    }, [searchParams, setSearchParams]);

    async function load() {
        setLoading(true);
        setErrorText(null);

        try {
            const meData = await fetchMe();
            setMe(meData);

            if (!isProfileComplete(meData)) {
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

    function openDeleteModal(): void {
        setDeleteConfirmed(false);
        setDeleteError(null);
        setIsDeleteOpen(true);
    }

    function closeDeleteModal(): void {
        if (deleteLoading) return;
        setIsDeleteOpen(false);
        setDeleteConfirmed(false);
        setDeleteError(null);
    }

    async function handleDeleteAccount(): Promise<void> {
        if (!deleteConfirmed || deleteLoading) return;

        setDeleteLoading(true);
        setDeleteError(null);

        try {
            await deleteMyAccount();
            clearAuthTokens();
            setMe(null);
            setIsDeleteOpen(false);
            navigate("/auth", { replace: true });
            return;
        } catch (error) {
            const status = getHttpStatus(error);
            if (status === 401 || status === 403) {
                clearAuthTokens();
                setMe(null);
                setIsDeleteOpen(false);
                navigate("/auth", { replace: true });
                return;
            }

            setDeleteError(getApiErrorMessage(error) ?? "Не удалось деактивировать профиль. Попробуйте ещё раз.");
        }

        setDeleteLoading(false);
    }

    return (
        <ProfilePageView
            loading={loading}
            errorText={errorText}
            me={me}
            mappedStats={mappedStats}
            isEditOpen={isEditOpen}
            isDeleteOpen={isDeleteOpen}
            isPasswordOpen={isPasswordOpen}
            deleteConfirmed={deleteConfirmed}
            deleteLoading={deleteLoading}
            deleteError={deleteError}
            onOpenEdit={() => setIsEditOpen(true)}
            onCloseEdit={() => setIsEditOpen(false)}
            onOpenDelete={openDeleteModal}
            onOpenPassword={() => setIsPasswordOpen(true)}
            onClosePassword={() => setIsPasswordOpen(false)}
            onCloseDelete={closeDeleteModal}
            onDeleteConfirmedChange={setDeleteConfirmed}
            onConfirmDelete={() => void handleDeleteAccount()}
            onReload={() => void load()}
        />
    );
}

function getHttpStatus(error: unknown): number | undefined {
    if (!error || typeof error !== "object" || !("response" in error)) {
        return undefined;
    }
    const response = (error as { response?: { status?: number } }).response;
    return response?.status;
}

function getApiErrorMessage(error: unknown): string | null {
    if (!error || typeof error !== "object" || !("response" in error)) {
        return null;
    }
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    return typeof response?.data?.message === "string" ? response.data.message : null;
}
