import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appStyles } from "../../../app/app.styles";
import { authenticateTelegram } from "../model/telegram-auth";
import { setAuthTokens } from "../../../shared/lib/tokens";
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
            try {
                const tokens = await authenticateTelegram(controller.signal);
                if (!active) return;
                setAuthTokens(tokens);
                navigate("/", { replace: true });
            } catch {
                if (active) setError(LOGIN_ERROR);
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
