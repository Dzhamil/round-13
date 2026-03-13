import { http } from "./http";

export type AuthTokensResponse = {
    accessToken: string;
    refreshToken: string;
};

/**
 * DTO под backend: передаём initData целиком (RAW query string).
 */
export type TelegramLoginRequest = {
    initData: string;
};

export async function telegramLogin(initData: string): Promise<AuthTokensResponse> {
    const payload: TelegramLoginRequest = { initData };

    const response = await http.post<AuthTokensResponse>(
        "/auth/telegram-login",
        payload
    );

    return response.data;
}

