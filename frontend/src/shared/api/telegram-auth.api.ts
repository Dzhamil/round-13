import { http } from "./http";

import type { AuthTokens } from "../lib/tokens";

export type AuthTokensResponse = AuthTokens;

/**
 * DTO под backend: передаём initData целиком (RAW query string).
 */
export type TelegramLoginRequest = {
    initData: string;
};

export async function telegramLogin(initData: string, signal?: AbortSignal): Promise<AuthTokensResponse> {
    const payload: TelegramLoginRequest = { initData };

    const response = await http.post<AuthTokensResponse>(
        "/auth/telegram-login",
        payload,
        { signal }
    );

    return response.data;
}

