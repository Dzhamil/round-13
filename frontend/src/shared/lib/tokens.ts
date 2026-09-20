const STORAGE_KEYS = {
    accessToken: "accessToken",
    refreshToken: "refreshToken"
} as const;

export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

let memoryTokens: AuthTokens | null = null;

function trySetItem(storage: Storage | undefined, key: string, value: string): boolean {
    if (!storage) return false;

    try {
        storage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
}

function tryGetItem(storage: Storage | undefined, key: string): string | null {
    if (!storage) return null;

    try {
        return storage.getItem(key);
    } catch {
        return null;
    }
}

function tryRemoveItem(storage: Storage | undefined, key: string): void {
    if (!storage) return;

    try {
        storage.removeItem(key);
    } catch {
        // Ignore storage cleanup failures; auth state also has an in-memory fallback.
    }
}

function getLocalStorage(): Storage | undefined {
    return typeof window === "undefined" ? undefined : window.localStorage;
}

function getSessionStorage(): Storage | undefined {
    return typeof window === "undefined" ? undefined : window.sessionStorage;
}

export function setAuthTokens(tokens: AuthTokens): void {
    memoryTokens = tokens;

    const localSaved = trySetItem(getLocalStorage(), STORAGE_KEYS.accessToken, tokens.accessToken)
        && trySetItem(getLocalStorage(), STORAGE_KEYS.refreshToken, tokens.refreshToken);

    if (localSaved) return;

    trySetItem(getSessionStorage(), STORAGE_KEYS.accessToken, tokens.accessToken);
    trySetItem(getSessionStorage(), STORAGE_KEYS.refreshToken, tokens.refreshToken);
}

export function getAccessToken(): string | null {
    return tryGetItem(getLocalStorage(), STORAGE_KEYS.accessToken)
        ?? tryGetItem(getSessionStorage(), STORAGE_KEYS.accessToken)
        ?? memoryTokens?.accessToken
        ?? null;
}

export function getRefreshToken(): string | null {
    return tryGetItem(getLocalStorage(), STORAGE_KEYS.refreshToken)
        ?? tryGetItem(getSessionStorage(), STORAGE_KEYS.refreshToken)
        ?? memoryTokens?.refreshToken
        ?? null;
}

export function clearAuthTokens(): void {
    memoryTokens = null;
    tryRemoveItem(getLocalStorage(), STORAGE_KEYS.accessToken);
    tryRemoveItem(getLocalStorage(), STORAGE_KEYS.refreshToken);
    tryRemoveItem(getSessionStorage(), STORAGE_KEYS.accessToken);
    tryRemoveItem(getSessionStorage(), STORAGE_KEYS.refreshToken);
}
