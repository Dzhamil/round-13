import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appStyles } from "../../../app/app.styles";
import { authenticateTelegram } from "../model/telegram-auth";
import { reportAuthDiagnostic } from "../../../shared/api/auth-diagnostics.api";
import { getAccessToken, setAuthTokens } from "../../../shared/lib/tokens";
import { Button } from "../../../shared/ui/Button";
import ErrorText from "../../../shared/ui/ErrorText";

const LOGIN_ERROR = "Не удалось войти через Telegram. Попробуйте открыть приложение заново или обратитесь в клуб.";

export function TelegramAuthPage() {
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();

        async function authenticate(): Promise<void> {
            const started = performance.now();
            const report = (category: Parameters<typeof reportAuthDiagnostic>[0]) =>
                reportAuthDiagnostic(category, performance.now() - started, 0);

            try {
                const tokens = await authenticateTelegram(controller.signal);
                if (!active) return;
                setAuthTokens(tokens);
                if (!getAccessToken()) {
                    report("token_storage_unavailable");
                    throw new Error("Auth tokens are not readable after Telegram login");
                }
                report("token_storage_success");
                navigate("/", { replace: true });
                report("post_login_navigation_started");
            } catch (cause) {
                if (active) setError(isAxiosError(cause) && cause.response?.data?.code === "USER_BLOCKED"
                    ? cause.response.data.message : LOGIN_ERROR);
            }
        }

        void authenticate();
        return () => {
            active = false;
            controller.abort();
        };
    }, [attempt, navigate]);

    return (
        <div style={appStyles.section}>
            <h2 style={{ margin: "0 0 12px 0", fontSize: 18 }}>Вход через Telegram</h2>
            {error ? (
                <div style={{ display: "grid", gap: 12 }}>
                    <ErrorText message={error} />
                    <Button type="button" onClick={() => {
                        setError(null);
                        setAttempt((value) => value + 1);
                    }}>
                        Повторить вход через Telegram
                    </Button>
                </div>
            ) : <p role="status">Проверяем ваш Telegram-аккаунт…</p>}
        </div>
    );
}
