import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearPanelAccessToken } from "../../../../../shared/lib/panelTokens";
import { fetchPanelMe } from "../../../auth/api/panelAuth.api";
import Loader from "../../../../../shared/ui/Loader/Loader";
import { getPanelErrorStatus } from "../../lib/panelApiError";

export type AdminGuardProps = { children: React.ReactNode };

export default function AdminGuard({ children }: AdminGuardProps) {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    useEffect(() => {
        let isMounted = true;

        void (async () => {
            try {
                await fetchPanelMe();
                if (isMounted) setChecking(false);
            } catch (e: unknown) {
                const status = getPanelErrorStatus(e);

                if (status === 401 || status === 403) {
                    clearPanelAccessToken();
                    navigate("/admin/login", { replace: true });
                    return;
                }

                if (isMounted) setChecking(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [navigate]);
    if (checking) return <Loader text="Проверяем доступ..." />;
    return <>{children}</>;
}
