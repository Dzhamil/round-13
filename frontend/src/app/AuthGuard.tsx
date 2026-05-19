// frontend/src/app/AuthGuard.tsx
import { PropsWithChildren, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { getMe } from "../shared/api/account.api";
import { clearAuthTokens, getAccessToken } from "../shared/lib/tokens";
import { isProfileComplete } from "../pages/profile/lib/profile.completeness";
import Loader from "../shared/ui/Loader/Loader";

export function AuthGuard({ children }: PropsWithChildren) {
    const token = getAccessToken();
    const location = useLocation();
    const navigate = useNavigate();

    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!token) {
            setIsChecking(false);
            return;
        }

        // онбординг всегда доступен
        if (location.pathname === "/profile/complete") {
            setIsChecking(false);
            return;
        }

        void checkProfileAndRedirect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, location.pathname]);

    async function checkProfileAndRedirect(): Promise<void> {
        try {
            const me = await getMe();

            if (!isProfileComplete(me)) {
                navigate("/profile/complete", { replace: true });
                return;
            }

            setIsChecking(false);
        } catch {
            clearAuthTokens();
            setIsChecking(false);
            navigate("/auth", { replace: true });
        }
    }

    if (!token) {
        return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
    }

    if (isChecking) {
        return <Loader text="Проверяем профиль..." />;
    }

    return <>{children}</>;
}
