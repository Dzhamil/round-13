import WebApp from "@twa-dev/sdk";

const FORCED_DARK_THEME_VARS = {
    "--tg-color-scheme": "dark",
    "--tg-theme-bg-color": "#0f1723",
    "--tg-theme-secondary-bg-color": "#18212b",
    "--tg-theme-section-bg-color": "#18212b",
    "--tg-theme-section-separator-color": "rgba(255,255,255,0.08)",
    "--tg-theme-text-color": "#e6edf3",
    "--tg-theme-hint-color": "rgba(230,237,243,0.68)",
    "--tg-theme-link-color": "#62b0ff",
    "--tg-theme-button-color": "#2ea6ff",
    "--tg-theme-button-text-color": "#ffffff",
    "--tg-theme-destructive-text-color": "#ff6b6b",
    "--tg-theme-subtitle-text-color": "rgba(230,237,243,0.82)",
    "--tg-theme-section-header-text-color": "#8ec5ff",
    "--tg-theme-accent-text-color": "#62b0ff",
} as const;

let darkThemeListenerBound = false;

function applyForcedDarkTheme(): void {
    if (typeof document === "undefined") return;

    const targets = [document.documentElement, document.body].filter(Boolean) as HTMLElement[];

    for (const target of targets) {
        target.style.setProperty("color-scheme", "dark", "important");
        target.style.setProperty("background-color", "#0f1723", "important");
        target.style.setProperty("color", "#e6edf3", "important");

        for (const [name, value] of Object.entries(FORCED_DARK_THEME_VARS)) {
            target.style.setProperty(name, value, "important");
        }
    }
}

/**
 * Единая точка доступа к Telegram WebApp (для legacy-импортов `tg`).
 * Если Telegram недоступен (браузер) — даём null, чтобы код мог это обработать.
 */
export const tg: any = (typeof window !== "undefined" && (window as any).Telegram?.WebApp)
    ? (window as any).Telegram.WebApp
    : null;

function telegramInitData(): string | null {
    if (!tg) return null;

    try {
        const initData = tg.initData;
        return typeof initData === "string" && initData.trim().length > 0 ? initData : null;
    } catch {
        return null;
    }
}

export function isTelegramWebApp(): boolean {
    return telegramInitData() !== null || Boolean(tg?.platform && tg.platform !== "unknown");
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

export function forceDarkTelegramTheme(): void {
    applyForcedDarkTheme();

    if (!isTelegramWebApp()) return;

    try {
        WebApp.setBackgroundColor?.("#0f1723");
        WebApp.setHeaderColor?.("#0f1723");
    } catch {
        // no-op
    }

    if (darkThemeListenerBound) return;

    darkThemeListenerBound = true;

    try {
        WebApp.onEvent?.("themeChanged", applyForcedDarkTheme);
    } catch {
        // no-op
    }
}

/**
 * Возвращает initData (подпись Telegram) как строку или null.
 */
export function getTelegramInitData(): string | null {
    return telegramInitData();
}

const TELEGRAM_CONTACT_TIMEOUT_MS = 20000;

/** Просит Telegram отправить боту подтверждённый контакт текущего пользователя. */
export function requestTelegramContact(): Promise<void> {
    if (!isTelegramWebApp() || typeof tg.requestContact !== "function") {
        return Promise.reject(new Error("Telegram contact request недоступен"));
    }
    return new Promise((resolve, reject) => {
        let settled = false;
        const complete = (action: () => void) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeoutId);
            action();
        };
        const timeoutId = window.setTimeout(() => {
            complete(() => reject(new Error("Telegram не вернул подтверждение номера. Попробуйте ещё раз.")));
        }, TELEGRAM_CONTACT_TIMEOUT_MS);

        try {
            tg.requestContact((shared: boolean) => {
                complete(() => {
                    if (shared) resolve();
                    else reject(new Error("Номер телефона не был отправлен"));
                });
            });
        } catch (error) {
            complete(() => reject(error));
        }
    });
}
