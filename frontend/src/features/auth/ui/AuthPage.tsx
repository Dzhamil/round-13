import { useSearchParams } from "react-router-dom";
import { Button } from "../../../shared/ui/Button";
import { isTelegramWebApp } from "../../../tg";
import { TelegramAuthPage } from "./TelegramAuthPage";
import { WebAuthPage } from "./WebAuthPage";

/** Selects the auth environment; each page owns its independent login flow. */
export function AuthPage() {
    const [params, setParams] = useSearchParams();
    if (params.get("reason") === "blocked") {
        return <div role="alert">
            <p>Ваш аккаунт заблокирован. Вы не можете пользоваться приложением. Для разблокировки обратитесь к владельцу приложения.</p>
            <Button onClick={() => setParams({}, { replace: true })}>Повторить вход</Button>
        </div>;
    }
    return isTelegramWebApp() ? <TelegramAuthPage /> : <WebAuthPage />;
}

export default AuthPage;
