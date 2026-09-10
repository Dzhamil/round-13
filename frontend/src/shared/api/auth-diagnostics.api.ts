import { getTelegramInitData, getTelegramWebApp } from "../../tg";

export type AuthDiagnosticCategory = "missing_init_data" | "init_data_timeout" | "transient_failure" | "permanent_auth_failure" | "aborted" | "success";

// This transport intentionally excludes auth headers, errors, URL query/hash and raw initData.
export function reportAuthDiagnostic(category: AuthDiagnosticCategory, elapsedMs: number, attemptCount: number): void {
    const webApp = getTelegramWebApp();
    const initData = getTelegramInitData();
    const platforms = ["ios", "android", "tdesktop", "macos", "web", "weba", "webk", "unigram"];
    const payload = {
        category,
        hasInitData: Boolean(initData),
        initDataLength: Math.min(initData?.length ?? 0, 100000),
        platform: platforms.includes(webApp?.platform ?? "") ? webApp!.platform : "unknown",
        webAppVersion: /^\d{1,3}\.\d{1,3}$/.test(webApp?.version ?? "") ? webApp!.version : "unknown",
        route: "/auth",
        release: import.meta.env.VITE_RELEASE,
        elapsedMs: Math.min(Math.max(0, Math.round(elapsedMs)), 300000),
        attemptCount,
    };
    const base = import.meta.env.DEV ? "/api" : (import.meta.env.VITE_API_BASE_URL?.trim() || "/api");
    void fetch(`${base.replace(/\/$/, "")}/auth/telegram-diagnostics`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), keepalive: true, credentials: "omit",
    }).catch(() => { /* Diagnostics must never interrupt authentication. */ });
}
