import { useEffect, useState } from "react";
import type { PanelUserListItem } from "../api/panelUsers.api";
import {
    fetchPanelUsers,
    blockUser,
    unblockUser,
    deleteUser,
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

    onBlock: (userId: string) => Promise<void>;
    onUnblock: (userId: string) => Promise<void>;
    onDelete: (userId: string) => Promise<void>;
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
    const [isLoading, setIsLoading] = useState(true);
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

    async function lifecycleAction(userId: string, action: (id: string) => Promise<void>): Promise<void> {
        setError(null);
        setIssuedTemporaryPassword(null);
        setActionLoadingUserId(userId);
        try {
            await action(userId);
            await reload();
        } catch (cause: unknown) {
            setError(extractPanelErrorMessage(cause, "Не удалось выполнить операцию"));
        } finally {
            setActionLoadingUserId(null);
        }
    }

    return {
        onBlock: (id) => lifecycleAction(id, blockUser),
        onUnblock: (id) => lifecycleAction(id, unblockUser),
        onDelete: (id) => lifecycleAction(id, deleteUser),
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
