import { panelHttp } from "../../../../shared/api/panelHttp";

export type PanelUserListItem = {
    id: string;
    nickname: string | null;
    phone: string | null;
    status: string;   // "ACTIVE" | "BLOCKED" и т.п.
    roleCode: string; // "ATHLETE" | "COACH" | "ADMIN"
};

const PANEL_USERS_RESPONSE_ERROR = "Некорректный ответ сервера админ-панели";

function isStringOrNull(value: unknown): value is string | null {
    return typeof value === "string" || value === null;
}

function parsePanelUserListItem(value: unknown): PanelUserListItem {
    if (value === null || typeof value !== "object") {
        throw new Error(PANEL_USERS_RESPONSE_ERROR);
    }

    const item = value as Record<string, unknown>;
    if (
        typeof item.id !== "string" ||
        !isStringOrNull(item.nickname) ||
        !isStringOrNull(item.phone) ||
        typeof item.status !== "string" ||
        typeof item.roleCode !== "string"
    ) {
        throw new Error(PANEL_USERS_RESPONSE_ERROR);
    }

    return {
        id: item.id,
        nickname: item.nickname,
        phone: item.phone,
        status: item.status,
        roleCode: item.roleCode,
    };
}

function parsePanelUsersResponse(value: unknown): PanelUserListItem[] {
    if (!Array.isArray(value)) {
        throw new Error(PANEL_USERS_RESPONSE_ERROR);
    }

    return value.map(parsePanelUserListItem);
}

export async function fetchPanelUsers(): Promise<PanelUserListItem[]> {
    const res = await panelHttp.get<unknown>("/panel/users");
    return parsePanelUsersResponse(res.data);
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

export type ManualUserRequest={surname:string;firstName:string;patronymic:string;phone:string;telegramNickname:string;password:string;generatePassword:boolean;roleCode:string};
export async function createManualUser(request:ManualUserRequest):Promise<{userId:string;issuedPassword:string}>{
    return (await panelHttp.post("/panel/users",request)).data;
}
