import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { telegramLogin } from "../../../shared/api/telegram-auth.api";
import { setAuthTokens } from "../../../shared/lib/tokens";
import { getTelegramInitData, isTelegramWebApp } from "../../../tg";
import { AUTH_MESSAGES } from "./auth.messages";
import type { AuthFlow, AuthStep } from "./auth.types";

/**
 * Auth flow под Telegram WebApp.
 * Шаги PHONE/CODE оставляем совместимыми с UI, но фактически используем авто-логин.
 */
export function useAuthFlow(): AuthFlow {
    const navigate = useNavigate();
    const [step, setStep] = useState<AuthStep>("PHONE");
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void autoLogin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function autoLogin(): Promise<void> {
        setError(null);

        if (!isTelegramWebApp()) {
            setError("Открой приложение внутри Telegram.");
            return;
        }

        const initData = getTelegramInitData();
        if (!initData) {
            setError("Telegram initData не найдено.");
            return;
        }

        setIsLoading(true);
        try {
            const tokens = await telegramLogin(initData);
            setAuthTokens(tokens);
            // Уводим с /auth сразу после сохранения токенов, дальше AuthGuard
            // сам решит, вести ли пользователя на онбординг или в приложение.
            navigate("/", { replace: true });
        } catch (e: any) {
            setError(e?.response?.data?.message ?? AUTH_MESSAGES.VERIFY_CODE_ERROR);
        } finally {
            setIsLoading(false);
        }
    }

    // Оставляем методы, чтобы не ломать текущий UI (пока)
    async function sendCode(): Promise<void> {
        setError("SMS-вход отключён. Используй Telegram Mini App.");
    }

    async function verifyAndLogin(): Promise<void> {
        await autoLogin();
    }

    function backToPhone(): void {
        setStep("PHONE");
        setCode("");
    }

    return {
        step,
        phone,
        setPhone,
        code,
        setCode,
        isLoading,
        error,
        sendCode,
        verifyAndLogin,
        backToPhone,
    };
}
