import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearPanelAccessToken } from "../../../../../shared/lib/panelTokens";
import { fetchPanelUsers } from "../../../users/api/panelUsers.api";
import Loader from "../../../../../shared/ui/Loader/Loader";

export type AdminGuardProps = { children: React.ReactNode };

export default function AdminGuard({ children }: AdminGuardProps) {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    useEffect(() => {
        void (async () => {
            try {
                await fetchPanelUsers();
                setChecking(false);
            } catch (e: any) {
                const status = e?.response?.status;
                if (status === 401 || status === 403) {
                    clearPanelAccessToken();
                    navigate("/admin/login", { replace: true });
                    return;
                }
                setChecking(false);
            }
        })();
    }, []);
    if (checking) return <Loader text="Проверяем доступ..." />;
    return <>{children}</>;
}
