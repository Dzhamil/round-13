import { useEffect, useState } from "react";
import type { PanelUserListItem } from "../api/panelUsers.api";
import {
    fetchPanelUsers,
    grantAdmin,
    revokeAdmin,
    grantCoach,
    revokeCoach,
    resetTemporaryPassword,
} from "../api/panelUsers.api";
import { extractPanelErrorMessage } from "../../shared/lib/panelApiError";

export type UsePanelUsersResult = {
    users: PanelUserListItem[];
    isLoading: boolean;
    error: string | null;
    actionLoadingUserId: string | null;
    issuedTemporaryPassword: { userId: string; password: string } | null;

    reload: () => Promise<void>;
    onGrantAdmin: (userId: string) => Promise<void>;
    onRevokeAdmin: (userId: string) => Promise<void>;
    onGrantCoach: (userId: string) => Promise<void>;
    onRevokeCoach: (userId: string) => Promise<void>;
    onResetTemporaryPassword: (userId: string) => Promise<void>;
    clearIssuedTemporaryPassword: () => void;
};

export function usePanelUsers(): UsePanelUsersResult {
    const [users, setUsers] = useState<PanelUserListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionLoadingUserId, setActionLoadingUserId] = useState<string | null>(null);
    const [issuedTemporaryPassword, setIssuedTemporaryPassword] = useState<{
        userId: string;
        password: string;
    } | null>(null);

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
        } catch (e: unknown) {
            setUsers([]);
            setError(extractPanelErrorMessage(e, "Не удалось выполнить операцию"));
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
        } catch (e: unknown) {
            setError(extractPanelErrorMessage(e, "Не удалось выполнить операцию"));
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
        } catch (e: unknown) {
            setError(extractPanelErrorMessage(e, "Не удалось выполнить операцию"));
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
        } catch (e: unknown) {
            setError(extractPanelErrorMessage(e, "Не удалось выполнить операцию"));
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
        } catch (e: unknown) {
            setError(extractPanelErrorMessage(e, "Не удалось выполнить операцию"));
        } finally {
            setActionLoadingUserId(null);
        }
    }

    async function onResetTemporaryPassword(userId: string): Promise<void> {
        setError(null);
        setIssuedTemporaryPassword(null);
        setActionLoadingUserId(userId);
        try {
            const result = await resetTemporaryPassword(userId);
            setIssuedTemporaryPassword({ userId: result.userId, password: result.issuedPassword });
        } catch (e: unknown) {
            setError(extractPanelErrorMessage(e, "Не удалось сбросить временный пароль"));
        } finally {
            setActionLoadingUserId(null);
        }
    }

    return {
        users,
        isLoading,
        error,
        actionLoadingUserId,
        issuedTemporaryPassword,
        reload,
        onGrantAdmin,
        onRevokeAdmin,
        onGrantCoach,
        onRevokeCoach,
        onResetTemporaryPassword,
        clearIssuedTemporaryPassword: () => setIssuedTemporaryPassword(null),
    };
}
