import { PropsWithChildren, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getMe } from "../shared/api/account.api";
import { clearAuthTokens, getAccessToken } from "../shared/lib/tokens";
import { isProfileComplete } from "../pages/profile/lib/profile.completeness";
import Loader from "../shared/ui/Loader/Loader";

export function AuthGuard({ children }: PropsWithChildren) {
    const token = getAccessToken();
    const location = useLocation();
    const [checked, setChecked] = useState<{
        token: string; path: string; complete: boolean; failed: boolean;
    } | null>(null);

    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        getMe().then(me => {
            if (!cancelled) setChecked({ token, path: location.pathname,
                complete: isProfileComplete(me), failed: false });
        }).catch(() => {
            if (!cancelled) {
                clearAuthTokens();
                setChecked({ token, path: location.pathname, complete: false, failed: true });
            }
        });
        return () => { cancelled = true; };
    }, [token, location.pathname]);

    if (!token || checked?.failed) {
        return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
    }
    // Never mount a protected page while its access check is pending.
    if (checked?.token !== token || checked.path !== location.pathname) {
        return <Loader text="Проверяем профиль..." />;
    }
    if (!checked.complete && location.pathname !== "/profile") {
        return <Navigate to="/profile?verify=1" replace />;
    }
    return <>{children}</>;
}
