import { panelHttp } from "../../../../shared/api/panelHttp";

export type PanelUserListItem = {
    id: string;
    nickname: string | null;
    phone: string | null;
    status: string;   // "ACTIVE" | "BLOCKED" и т.п.
    roleCode: string; // "ATHLETE" | "COACH" | "ADMIN"
};

export async function fetchPanelUsers(): Promise<PanelUserListItem[]> {
    const res = await panelHttp.get<PanelUserListItem[]>("/panel/users");
    return res.data;
}

export async function grantAdmin(userId: string): Promise<void> {
    await panelHttp.post(`/panel/users/${userId}/grant-admin`);
}

export async function revokeAdmin(userId: string): Promise<void> {
    await panelHttp.post(`/panel/users/${userId}/revoke-admin`);
}

/**
 * Назначить пользователя тренером.
 */
export async function grantCoach(userId: string): Promise<void> {
    await panelHttp.post(`/panel/users/${userId}/grant-coach`);
}

/**
 * Снять тренерскую роль с пользователя (возвращает в атлеты).
 */
export async function revokeCoach(userId: string): Promise<void> {
    await panelHttp.post(`/panel/users/${userId}/revoke-coach`);
}
