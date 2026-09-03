import { appStyles } from "../../../app/app.styles";
import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorText from "../../../shared/ui/ErrorText";
import { Button } from "../../../shared/ui/Button";
import { login, telegramRecoveryLogin } from "../../../shared/api/auth.api";
import { setWebPassword } from "../../../shared/api/account.api";
import { telegramLogin } from "../../../shared/api/telegram-auth.api";
import { formatRussianPhone, normalizeRussianPhone } from "../../../shared/lib/phone";
import { setAuthTokens } from "../../../shared/lib/tokens";
import { getTelegramInitData, isTelegramWebApp, requestTelegramContact } from "../../../tg";

/**
 * Страница web-авторизации по телефону и паролю с сохранением Telegram auto-login.
 * После логина редиректы выполняет AuthGuard (проверка /account/me и /profile/complete).
 */
export function AuthPage() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRecovery, setIsRecovery] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    useEffect(() => {
        if (!isTelegramWebApp()) return;
        const initData = getTelegramInitData();
        if (!initData) return;
        setIsLoading(true);
        telegramRecoveryLogin(initData)
            .then((tokens) => {
                setAuthTokens(tokens);
                navigate("/", { replace: true });
            })
            .catch((cause) => {
                if (cause?.response?.status !== 404) {
                    setError(cause?.response?.data?.message ?? "Не удалось войти через Telegram");
                }
            })
            .finally(() => setIsLoading(false));
    }, [navigate]);

    async function submit(event: FormEvent): Promise<void> {
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

    async function recoverPassword(): Promise<void> {
        const initData = getTelegramInitData();
        if (!initData) return;
        setIsLoading(true);
        setError(null);
        try {
            await requestTelegramContact();
            let tokens;
            for (let attempt = 0; attempt < 5; attempt += 1) {
                try {
                    tokens = await telegramRecoveryLogin(initData);
                    break;
                } catch (cause: any) {
                    if (cause?.response?.status !== 404 || attempt === 4) throw cause;
                    await new Promise((resolve) => window.setTimeout(resolve, 800));
                }
            }
            if (!tokens) throw new Error("Контакт ещё не обработан");
            setAuthTokens(tokens);
            setIsRecovery(true);
        } catch (cause: any) {
            setError(cause?.response?.data?.message ?? cause?.message ?? "Не удалось подтвердить номер");
        } finally {
            setIsLoading(false);
        }
    }

    async function createTelegramAccount(): Promise<void> {
        const initData = getTelegramInitData();
        if (!initData) return;
        setIsLoading(true);
        setError(null);
        try {
            const tokens = await telegramLogin(initData);
            setAuthTokens(tokens);
            navigate("/", { replace: true });
        } catch (cause: any) {
            setError(cause?.response?.data?.message ?? "Не удалось создать аккаунт");
        } finally {
            setIsLoading(false);
        }
    }

    async function saveRecoveredPassword(event: FormEvent): Promise<void> {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await setWebPassword(newPassword, passwordConfirmation);
            navigate("/", { replace: true });
        } catch (cause: any) {
            setError(cause?.response?.data?.message ?? "Не удалось сохранить пароль");
        } finally {
            setIsLoading(false);
        }
    }

    if (isRecovery) {
        return (
            <div style={appStyles.section}>
                <h2 style={{ margin: "0 0 12px 0", fontSize: 18 }}>Новый пароль для входа</h2>
                <form onSubmit={(event) => void saveRecoveredPassword(event)} style={{ display: "grid", gap: 12 }}>
                    <input aria-label="Новый пароль" type="password" minLength={8} value={newPassword}
                           onChange={(event) => setNewPassword(event.target.value)} />
                    <input aria-label="Повторите пароль" type="password" minLength={8} value={passwordConfirmation}
                           onChange={(event) => setPasswordConfirmation(event.target.value)} />
                    <Button type="submit" disabled={isLoading || newPassword.length < 8}>
                        {isLoading ? "Сохраняем..." : "Задать новый пароль"}
                    </Button>
                </form>
                {error && <ErrorText message={error} />}
            </div>
        );
    }

    return (
        <div style={appStyles.section}>
            <h2 style={{ margin: "0 0 12px 0", fontSize: 18 }}>Вход в Round13</h2>

            <form onSubmit={(event) => void submit(event)} style={{ display: "grid", gap: 12 }}>
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

            {isTelegramWebApp() && (
                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                    <Button type="button" disabled={isLoading} onClick={() => void recoverPassword()}>
                        Восстановить пароль
                    </Button>
                    <Button type="button" disabled={isLoading} onClick={() => void createTelegramAccount()}>
                        Создать новый аккаунт
                    </Button>
                </div>
            )}

            {error && <ErrorText message={error} />}
        </div>
    );
}

export default AuthPage;
