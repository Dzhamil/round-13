const STORAGE_KEYS = {
    accessToken: "accessToken",
    refreshToken: "refreshToken"
} as const;

export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

export function setAuthTokens(tokens: AuthTokens): void {
    localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
}

export function getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
}

export function clearAuthTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
}
