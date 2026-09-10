import axios from "axios";
import { getTelegramInitData } from "../../../tg";
import { telegramLogin } from "../../../shared/api/telegram-auth.api";
import { reportAuthDiagnostic } from "../../../shared/api/auth-diagnostics.api";

export const INIT_DATA_WINDOW_MS = 4000;
const POLL_MS = 250;
const MAX_LOGIN_ATTEMPTS = 3;

function wait(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        signal.throwIfAborted();
        const onAbort = () => {
            clearTimeout(timer);
            reject(new DOMException("Aborted", "AbortError"));
        };
        const timer = setTimeout(() => {
            signal.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        signal.addEventListener("abort", onAbort, { once: true });
    });
}

function isTransient(error: unknown): boolean {
    return axios.isAxiosError(error) && !axios.isCancel(error) &&
        (!error.response || error.response.status >= 500 || error.response.status === 408 || error.response.status === 429);
}

/** Bounded, cancellable auth flow; the UI only observes final success/failure. */
export async function authenticateTelegram(signal: AbortSignal) {
    const started = performance.now();
    let attempts = 0;
    const report = (category: Parameters<typeof reportAuthDiagnostic>[0]) =>
        reportAuthDiagnostic(category, performance.now() - started, attempts);
    try {
        signal.throwIfAborted();
        let initData = getTelegramInitData();
        if (!initData) report("missing_init_data");
        while (!initData && performance.now() - started < INIT_DATA_WINDOW_MS) {
            await wait(Math.min(POLL_MS, INIT_DATA_WINDOW_MS - (performance.now() - started)), signal);
            initData = getTelegramInitData();
        }
        if (!initData) {
            report("init_data_timeout");
            throw new Error("Telegram initialization timed out");
        }
        for (attempts = 1; attempts <= MAX_LOGIN_ATTEMPTS; attempts++) {
            signal.throwIfAborted();
            try {
                const tokens = await telegramLogin(getTelegramInitData() ?? initData, signal);
                signal.throwIfAborted();
                report("success");
                return tokens;
            } catch (error) {
                if (signal.aborted) throw error;
                const transient = isTransient(error);
                report(transient ? "transient_failure" : "permanent_auth_failure");
                if (!transient || attempts === MAX_LOGIN_ATTEMPTS) throw error;
                await wait(500 * 2 ** (attempts - 1), signal);
            }
        }
        throw new Error("Telegram login attempts exhausted");
    } catch (error) {
        if (signal.aborted) report("aborted");
        throw error;
    }
}
