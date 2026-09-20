import { panelHttp } from "../../../../shared/api/panelHttp";

export type PanelUserListItem = {
    id: string;
    surname: string | null;
    firstName: string | null;
    patronymic: string | null;
    fullName: string | null;
    nickname: string | null;
    phone: string | null;
    status: string;   // "ACTIVE" | "BLOCKED" и т.п.
    trainer: boolean;
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
        !isStringOrNull(item.surname) ||
        !isStringOrNull(item.firstName) ||
        !isStringOrNull(item.patronymic) ||
        !isStringOrNull(item.fullName) ||
        !isStringOrNull(item.nickname) ||
        !isStringOrNull(item.phone) ||
        typeof item.status !== "string" ||
        typeof item.roleCode !== "string" ||
        typeof item.trainer !== "boolean"
    ) {
        throw new Error(PANEL_USERS_RESPONSE_ERROR);
    }

    return {
        id: item.id,
        surname: item.surname,
        firstName: item.firstName,
        patronymic: item.patronymic,
        fullName: item.fullName,
        nickname: item.nickname,
        phone: item.phone,
        status: item.status,
        roleCode: item.roleCode,
        trainer: item.trainer,
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
 * Снять тренерство, сохранив права администратора.
 */
export async function revokeCoach(userId: string): Promise<void> {
    await panelHttp.post(`/panel/users/${userId}/revoke-coach`);
}

export type ManualUserRequest = {
    surname: string;
    firstName: string;
    patronymic: string;
    phone: string;
    telegramNickname: string;
    password?: string;
    generatePassword: boolean;
    roleCode: "ATHLETE" | "COACH" | "ADMIN";
};

export type ManualUserResponse = {
    userId: string;
    issuedPassword: string;
};

export type TemporaryPasswordResponse = ManualUserResponse;

export async function createManualUser(request: ManualUserRequest): Promise<ManualUserResponse> {
    return (await panelHttp.post<ManualUserResponse>("/panel/users", request)).data;
}

export async function resetTemporaryPassword(userId: string): Promise<TemporaryPasswordResponse> {
    return (
        await panelHttp.post<TemporaryPasswordResponse>(
            `/panel/users/${userId}/reset-temporary-password`,
        )
    ).data;
}

export async function blockUser(userId: string): Promise<void> {
    await panelHttp.post(`/panel/users/${userId}/block`);
}

export async function unblockUser(userId: string): Promise<void> {
    await panelHttp.post(`/panel/users/${userId}/unblock`);
}

export async function deleteUser(userId: string): Promise<void> {
    await panelHttp.delete(`/panel/users/${userId}`);
}
