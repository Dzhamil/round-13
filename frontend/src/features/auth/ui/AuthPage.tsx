import { appStyles } from "../../../app/app.styles";
import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorText from "../../../shared/ui/ErrorText";
import { Button } from "../../../shared/ui/Button";
import { login } from "../../../shared/api/auth.api";
import { telegramLogin } from "../../../shared/api/telegram-auth.api";
import { formatRussianPhone, normalizeRussianPhone } from "../../../shared/lib/phone";
import { setAuthTokens } from "../../../shared/lib/tokens";
import { getTelegramInitData, isTelegramWebApp } from "../../../tg";

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

    useEffect(() => {
        if (!isTelegramWebApp()) return;
        const initData = getTelegramInitData();
        if (!initData) return;
        setIsLoading(true);
        telegramLogin(initData)
            .then((tokens) => {
                setAuthTokens(tokens);
                navigate("/", { replace: true });
            })
            .catch((cause) => setError(cause?.response?.data?.message ?? "Не удалось войти через Telegram"))
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

            {error && <ErrorText message={error} />}
        </div>
    );
}

export default AuthPage;
