import WebApp from "@twa-dev/sdk";

/**
 * Единая точка доступа к Telegram WebApp (для legacy-импортов `tg`).
 * Если Telegram недоступен (браузер) — даём null, чтобы код мог это обработать.
 */
export const tg: any = (typeof window !== "undefined" && (window as any).Telegram?.WebApp)
    ? (window as any).Telegram.WebApp
    : null;

export function isTelegramWebApp(): boolean {
    return Boolean(tg);
}

/**
 * Инициализация Telegram WebApp (если доступно).
 */
export function initTelegramWebApp(): void {
    if (!isTelegramWebApp()) return;

    try {
        WebApp.ready();
        WebApp.expand();
    } catch {
        // no-op
    }
}

/**
 * Возвращает initData (подпись Telegram) как строку или null.
 */
export function getTelegramInitData(): string | null {
    if (!isTelegramWebApp()) return null;
    try {
        return WebApp.initData || null;
    } catch {
        return null;
    }
}
