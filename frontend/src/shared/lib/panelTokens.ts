const STORAGE_KEY = "panelAccessToken";

export function setPanelAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEY, token);
}

export function getPanelAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEY);
}

export function clearPanelAccessToken(): void {
    localStorage.removeItem(STORAGE_KEY);
}
