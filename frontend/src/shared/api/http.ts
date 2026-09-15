import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import {
    clearAuthTokens,
    getAccessToken,
    getRefreshToken,
    setAuthTokens,
    type AuthTokens,
} from "../lib/tokens";

/**
 * Прод/dev:
 * - В dev используем относительный /api (vite proxy).
 * - В prod можно переопределить через VITE_API_BASE_URL.
 */
const isDev = import.meta.env.DEV;

const API_BASE_URL = isDev
    ? "/api"
    : (import.meta.env.VITE_API_BASE_URL?.trim() || "/api");

export const http = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
});

type RetriableRequestConfig = InternalAxiosRequestConfig & { authRetryAttempted?: boolean };

const AUTH_BOOTSTRAP_ENDPOINTS = new Set([
    "/auth/login",
    "/auth/telegram-login",
    "/auth/telegram-recovery-login",
    "/auth/telegram-link",
]);

export class AuthRequiredError extends Error {
    constructor() {
        super("Требуется повторный вход");
        this.name = "AuthRequiredError";
    }
}

let refreshInFlight: Promise<AuthTokens> | null = null;

function redirectToAuth(): void {
    if (window.location.pathname !== "/auth") {
        window.location.assign("/auth");
    }
}

async function refreshAuthTokens(): Promise<AuthTokens> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new AuthRequiredError();
    }

    const response = await refreshClient.post<AuthTokens>("/auth/refresh", { refreshToken });
    setAuthTokens(response.data);
    return response.data;
}

function requireAuthentication(): AuthRequiredError {
    clearAuthTokens();
    redirectToAuth();
    return new AuthRequiredError();
}

/**
 * Interceptor: подставляем Authorization: Bearer <token>
 */
http.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

http.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const request = error.config as RetriableRequestConfig | undefined;

        if (error.response?.status !== 401 || !request || AUTH_BOOTSTRAP_ENDPOINTS.has(request.url ?? "")) {
            return Promise.reject(error);
        }

        if (request.authRetryAttempted) {
            return Promise.reject(requireAuthentication());
        }

        request.authRetryAttempted = true;

        try {
            refreshInFlight ??= refreshAuthTokens().finally(() => {
                refreshInFlight = null;
            });
            const tokens = await refreshInFlight;
            request.headers = AxiosHeaders.from(request.headers);
            request.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
            return http.request(request);
        } catch {
            return Promise.reject(requireAuthentication());
        }
    },
);
