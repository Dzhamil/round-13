import { appStyles } from "../../../app/app.styles";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import ErrorText from "../../../shared/ui/ErrorText";
import { Button } from "../../../shared/ui/Button";
import type { AuthTokensResponse } from "../../../shared/api/auth.api";
import { login, telegramRecoveryLogin } from "../../../shared/api/auth.api";
import { telegramLogin } from "../../../shared/api/telegram-auth.api";
import { formatRussianPhone, normalizeRussianPhone } from "../../../shared/lib/phone";
import { setAuthTokens } from "../../../shared/lib/tokens";
import { getTelegramInitData, requestTelegramContact } from "../../../tg";

const TELEGRAM_LOGIN_ERROR =
    "Не удалось войти через Telegram. Подтвердите свой номер телефона в Telegram, чтобы восстановить доступ к существующему аккаунту.";
const TELEGRAM_TIMEOUT_ERROR =
    "Сервер не ответил вовремя. Проверьте связь и повторите вход через Telegram.";
const TELEGRAM_RECOVERY_NOT_READY_ERROR =
    "Telegram подтвердил номер, но аккаунт ещё не связался. Повторите подтверждение через несколько секунд.";
const TELEGRAM_RECOVERY_ATTEMPTS = 10;
const TELEGRAM_RECOVERY_RETRY_DELAY_MS = 1000;

/** Страница авторизации: Telegram initData в Mini App, телефон и пароль в обычном браузере. */
export function AuthPage() {
    const telegramInitData = getTelegramInitData();

    if (telegramInitData) {
        return <TelegramAuthPage initData={telegramInitData} />;
    }

    return <BrowserAuthPage />;
}

type TelegramAuthPageProps = {
    initData: string;
};

function TelegramAuthPage({ initData }: TelegramAuthPageProps) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const authenticateWithTelegram = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            const tokens = await telegramLogin(initData);
            completeAuth(tokens, navigate);
        } catch {
            setError(TELEGRAM_LOGIN_ERROR);
        } finally {
            setIsLoading(false);
        }
    }, [initData, navigate]);

    useEffect(() => {
        void authenticateWithTelegram();
    }, [authenticateWithTelegram]);

    async function recoverTelegramAccess(): Promise<void> {
        setIsLoading(true);
        setError(null);
        try {
            await requestTelegramContact();
            const tokens = await waitForTelegramRecovery(initData);
            completeAuth(tokens, navigate);
        } catch (cause: unknown) {
            setError(getTelegramRecoveryErrorMessage(cause));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={appStyles.section}>
            <h2 style={{ margin: "0 0 12px 0", fontSize: 18 }}>Вход через Telegram</h2>
            <p style={{ margin: "0 0 12px 0" }}>
                {isLoading ? "Проверяем ваш Telegram-аккаунт…" : "Используем данные Telegram для безопасного входа."}
            </p>
            {error && (
                <div style={{ display: "grid", gap: 12 }}>
                    <ErrorText message={error} />
                    <Button type="button" disabled={isLoading} onClick={() => void recoverTelegramAccess()}>
                        {isLoading ? "Подтверждаем…" : "Подтвердить номер через Telegram"}
                    </Button>
                    <Button type="button" disabled={isLoading} onClick={() => void authenticateWithTelegram()}>
                        Повторить вход через Telegram
                    </Button>
                </div>
            )}
        </div>
    );
}

function BrowserAuthPage() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submitBrowserLogin(event: FormEvent): Promise<void> {
        event.preventDefault();
        const normalizedPhone = normalizeRussianPhone(phone);
        if (!normalizedPhone) {
            setError("Введите российский номер телефона полностью");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const tokens = await login({ phone: normalizedPhone, password });
            completeAuth(tokens, navigate);
        } catch (cause: any) {
            setError(cause?.response?.data?.message ?? "Неверный телефон или пароль");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={appStyles.section}>
            <h2 style={{ margin: "0 0 12px 0", fontSize: 18 }}>Вход в Round13</h2>

            <form onSubmit={(event) => void submitBrowserLogin(event)} style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 6 }}>
                    <span>Телефон</span>
                    <input
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        placeholder="+7 (939) 393-09-20"
                        onChange={(event) => setPhone(formatRussianPhone(event.target.value))}
                        style={{ padding: 12, borderRadius: 10, fontSize: 16 }}
                    />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                    <span>Пароль</span>
                    <input
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        style={{ padding: 12, borderRadius: 10, fontSize: 16 }}
                    />
                </label>
                <Button type="submit" disabled={isLoading || !password}>
                    {isLoading ? "Входим..." : "Войти"}
                </Button>
            </form>

            {error && <ErrorText message={error} />}
        </div>
    );
}

function completeAuth(tokens: AuthTokensResponse, navigate: ReturnType<typeof useNavigate>): void {
    setAuthTokens(tokens);
    navigate("/", { replace: true });
}

async function waitForTelegramRecovery(initData: string): Promise<AuthTokensResponse> {
    for (let attempt = 0; attempt < TELEGRAM_RECOVERY_ATTEMPTS; attempt += 1) {
        try {
            return await telegramRecoveryLogin(initData);
        } catch (cause: unknown) {
            if (!isRecoveryNotReady(cause) || attempt === TELEGRAM_RECOVERY_ATTEMPTS - 1) {
                throw cause;
            }
            await wait(TELEGRAM_RECOVERY_RETRY_DELAY_MS);
        }
    }

    throw new Error(TELEGRAM_RECOVERY_NOT_READY_ERROR);
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getTelegramRecoveryErrorMessage(cause: unknown): string {
    if (isTimeoutError(cause)) {
        return TELEGRAM_TIMEOUT_ERROR;
    }

    if (isRecoveryNotReady(cause)) {
        return TELEGRAM_RECOVERY_NOT_READY_ERROR;
    }

    const responseMessage = getResponseMessage(cause);
    if (responseMessage) {
        return responseMessage;
    }

    const message = cause instanceof Error ? cause.message : null;
    return message || "Не удалось подтвердить номер через Telegram";
}

function isRecoveryNotReady(cause: unknown): boolean {
    return getAxiosStatus(cause) === 404;
}

function isTimeoutError(cause: unknown): boolean {
    if (!isAxiosLikeError(cause)) {
        return cause instanceof Error && cause.message.toLowerCase().includes("timeout");
    }

    return cause.code === "ECONNABORTED" || (cause.message ?? "").toLowerCase().includes("timeout");
}

function getResponseMessage(cause: unknown): string | null {
    if (!isAxiosLikeError(cause)) return null;

    const data = cause.response?.data;
    if (isErrorResponse(data)) {
        return data.message;
    }

    return null;
}

function getAxiosStatus(cause: unknown): number | undefined {
    return isAxiosLikeError(cause) ? cause.response?.status : undefined;
}

function isAxiosLikeError(cause: unknown): cause is AxiosError<unknown> {
    return typeof cause === "object" && cause !== null && "isAxiosError" in cause;
}

function isErrorResponse(data: unknown): data is { message: string } {
    return typeof data === "object"
        && data !== null
        && "message" in data
        && typeof (data as { message?: unknown }).message === "string";
}

export default AuthPage;
