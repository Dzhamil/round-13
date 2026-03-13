import { useEffect, useState } from "react";
import type { PanelUserListItem } from "../api/panelUsers.api";
import {
    fetchPanelUsers,
    grantAdmin,
    revokeAdmin,
    grantCoach,
    revokeCoach,
} from "../api/panelUsers.api";

function extractErrorMessage(e: any): string {
    return (
        e?.response?.data?.message ||
        e?.message ||
        "Не удалось выполнить операцию"
    );
}

export type UsePanelUsersResult = {
    users: PanelUserListItem[];
    isLoading: boolean;
    error: string | null;
    actionLoadingUserId: string | null;

    reload: () => Promise<void>;
    onGrantAdmin: (userId: string) => Promise<void>;
    onRevokeAdmin: (userId: string) => Promise<void>;
    onGrantCoach: (userId: string) => Promise<void>;
    onRevokeCoach: (userId: string) => Promise<void>;
};

export function usePanelUsers(): UsePanelUsersResult {
    const [users, setUsers] = useState<PanelUserListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionLoadingUserId, setActionLoadingUserId] = useState<string | null>(null);

    useEffect(() => {
        void reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function reload(): Promise<void> {
        setError(null);
        setIsLoading(true);
        try {
            const list = await fetchPanelUsers();
            setUsers(list);
        } catch (e: any) {
            setError(extractErrorMessage(e));
        } finally {
            setIsLoading(false);
        }
    }

    async function onGrantAdmin(userId: string): Promise<void> {
        setError(null);
        setActionLoadingUserId(userId);
        try {
            await grantAdmin(userId);
            await reload();
        } catch (e: any) {
            setError(extractErrorMessage(e));
        } finally {
            setActionLoadingUserId(null);
        }
    }

    async function onGrantCoach(userId: string): Promise<void> {
        setError(null);
        setActionLoadingUserId(userId);
        try {
            await grantCoach(userId);
            await reload();
        } catch (e: any) {
            setError(extractErrorMessage(e));
        } finally {
            setActionLoadingUserId(null);
        }
    }

    async function onRevokeCoach(userId: string): Promise<void> {
        setError(null);
        setActionLoadingUserId(userId);
        try {
            await revokeCoach(userId);
            await reload();
        } catch (e: any) {
            setError(extractErrorMessage(e));
        } finally {
            setActionLoadingUserId(null);
        }
    }
    async function onRevokeAdmin(userId: string): Promise<void> {
        setError(null);
        setActionLoadingUserId(userId);
        try {
            await revokeAdmin(userId);
            await reload();
        } catch (e: any) {
            setError(extractErrorMessage(e));
        } finally {
            setActionLoadingUserId(null);
        }
    }

    return {
        users,
        isLoading,
        error,
        actionLoadingUserId,
        reload,
        onGrantAdmin,
        onRevokeAdmin,
        onGrantCoach,
        onRevokeCoach,
    };
}
