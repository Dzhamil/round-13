import { appStyles } from "../../../app/app.styles";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorText from "../../../shared/ui/ErrorText";
import { Button } from "../../../shared/ui/Button";
import { login, telegramRecoveryLogin } from "../../../shared/api/auth.api";
import { telegramLogin } from "../../../shared/api/telegram-auth.api";
import { formatRussianPhone, normalizeRussianPhone } from "../../../shared/lib/phone";
import { setAuthTokens } from "../../../shared/lib/tokens";
import { getTelegramInitData, requestTelegramContact } from "../../../tg";

const TELEGRAM_LOGIN_ERROR =
    "Не удалось войти через Telegram. Подтвердите свой номер телефона в Telegram, чтобы восстановить доступ к существующему аккаунту.";

/** Страница авторизации: Telegram initData в Mini App, телефон и пароль в обычном браузере. */
export function AuthPage() {
    const navigate = useNavigate();
    const telegramInitData = getTelegramInitData();
    const isTelegramContext = telegramInitData !== null;
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(isTelegramContext);
    const [error, setError] = useState<string | null>(null);

    const authenticateWithTelegram = useCallback(async (initData: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            const tokens = await telegramLogin(initData);
            setAuthTokens(tokens);
            navigate("/", { replace: true });
        } catch {
            setError(TELEGRAM_LOGIN_ERROR);
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (!telegramInitData) return;
        void authenticateWithTelegram(telegramInitData);
    }, [authenticateWithTelegram, telegramInitData]);

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
            setAuthTokens(tokens);
            navigate("/", { replace: true });
        } catch (cause: any) {
            setError(cause?.response?.data?.message ?? "Неверный телефон или пароль");
        } finally {
            setIsLoading(false);
        }
    }

    async function recoverTelegramAccess(): Promise<void> {
        if (!telegramInitData) return;
        setIsLoading(true);
        setError(null);
        try {
            await requestTelegramContact();
            let tokens;
            for (let attempt = 0; attempt < 5; attempt += 1) {
                try {
                    tokens = await telegramRecoveryLogin(telegramInitData);
                    break;
                } catch (cause: any) {
                    if (cause?.response?.status !== 404 || attempt === 4) throw cause;
                    await new Promise((resolve) => window.setTimeout(resolve, 800));
                }
            }
            if (!tokens) throw new Error("Контакт ещё не обработан");
            setAuthTokens(tokens);
            navigate("/", { replace: true });
        } catch (cause: any) {
            setError(cause?.response?.data?.message ?? cause?.message ?? "Не удалось подтвердить номер через Telegram");
        } finally {
            setIsLoading(false);
        }
    }

    if (isTelegramContext) {
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
                        <Button type="button" disabled={isLoading} onClick={() => void authenticateWithTelegram(telegramInitData)}>
                            Повторить вход через Telegram
                        </Button>
                    </div>
                )}
            </div>
        );
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

export default AuthPage;
