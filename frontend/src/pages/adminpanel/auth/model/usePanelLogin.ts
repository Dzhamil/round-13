import { useState } from "react";
import { panelLogin } from "../api/panelAuth.api";
import { clearPanelAccessToken } from "../../../../shared/lib/panelTokens";

function extractErrorMessage(e: any): string {
    return e?.response?.data?.message || e?.message || "Не удалось выполнить вход";
}

export function usePanelLogin() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(): Promise<boolean> {
        setError(null);
        const normalizedLogin = login.trim();
        if (!normalizedLogin || !password) {
            setError("Заполни логин и пароль");
            return false;
        }
        setIsLoading(true);
        try {
            await panelLogin({ login: normalizedLogin, password });
            // очищаем старый токен, работа переходит на session cookie
            clearPanelAccessToken();
            return true;
        } catch (e: any) {
            setError(extractErrorMessage(e));
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    return { login, password, isLoading, error, setLogin, setPassword, submit };
}
