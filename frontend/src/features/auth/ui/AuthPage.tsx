import { appStyles } from "../../../app/app.styles";
import { useAuthFlow } from "../model/useAuthFlow";
import ErrorText from "../../../shared/ui/ErrorText";
import { Button } from "../../../shared/ui/Button";

/**
 * Страница авторизации через Telegram WebApp.
 * После логина редиректы выполняет AuthGuard (проверка /account/me и /profile/complete).
 */
export function AuthPage() {
    const { isLoading, error, verifyAndLogin } = useAuthFlow();

    return (
        <div style={appStyles.section}>
            <h2 style={{ margin: "0 0 12px 0", fontSize: 18 }}>Вход в Round13</h2>

            <p style={{ margin: "0 0 16px 0", fontSize: 14, lineHeight: 1.45, color: "var(--tg-theme-hint-color, #6B7280)" }}>
                Для безопасности вход работает только внутри приложения в Telegram.
            </p>

            <Button onClick={verifyAndLogin} disabled={isLoading} fullWidth>
                {isLoading ? "Проверяем вход..." : "Повторить вход через Telegram"}
            </Button>

            {error && <ErrorText message={error} />}
        </div>
    );
}

export default AuthPage;
