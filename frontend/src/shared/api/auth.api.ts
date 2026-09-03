import { http } from "./http";

/**
 * Запрос на отправку SMS-кода.
 */
export type SendPhoneVerificationCodeRequest = {
    phone: string;
};

/**
 * Запрос на проверку SMS-кода.
 */
export type VerifyPhoneCodeRequest = {
    phone: string;
    code: string;
};

/**
 * Запрос на логин.
 *
 * В текущем backend контракте /api/auth/login ожидает { phone, password }.
 * На фронте у нас flow "phone + sms code", поэтому маппим code -> password.
 *
 * Позже (когда бэк будет passwordless) этот маппинг уберем.
 */
export type LoginRequest = {
    phone: string;
    password: string;
};

/**
 * Ответ успешной аутентификации с парой токенов.
 */
export type AuthTokensResponse = {
    accessToken: string;
    refreshToken: string;
};

/**
 * Отправляет SMS-код подтверждения.
 */
export function sendPhoneVerificationCode(
    request: SendPhoneVerificationCodeRequest
): Promise<void> {
    return http.post("/phone-verification/send", request).then(() => undefined);
}

/**
 * Проверяет SMS-код подтверждения.
 */
export function verifyPhoneCode(request: VerifyPhoneCodeRequest): Promise<void> {
    return http.post("/phone-verification/verify", request).then(() => undefined);
}

/**
 * Выполняет логин пользователя.
 *
 * Backend: LoginRequest(phone, password)
 * Frontend: LoginRequest(phone, code)
 */
export function login(request: LoginRequest): Promise<AuthTokensResponse> {
    return http
        .post<AuthTokensResponse>("/auth/login", {
            phone: request.phone,
            password: request.password
        })
        .then(r => r.data);
}

export function telegramRecoveryLogin(initData: string): Promise<AuthTokensResponse> {
    return http.post<AuthTokensResponse>("/auth/telegram-recovery-login", { initData }).then((r) => r.data);
}

export function linkTelegramAccount(
    initData: string,
    request: LoginRequest
): Promise<AuthTokensResponse> {
    return http.post<AuthTokensResponse>("/auth/telegram-link", { initData, ...request }).then((r) => r.data);
}
