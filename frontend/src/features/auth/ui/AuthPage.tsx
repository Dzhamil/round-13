import { isTelegramWebApp } from "../../../tg";
import { TelegramAuthPage } from "./TelegramAuthPage";
import { WebAuthPage } from "./WebAuthPage";

/** Selects the auth environment; each page owns its independent login flow. */
export function AuthPage() {
    return isTelegramWebApp() ? <TelegramAuthPage /> : <WebAuthPage />;
}

export default AuthPage;
