// frontend/src/pages/shop/model/useIsAdmin.ts
import { useEffect, useState } from "react";
import { getMe } from "../../../shared/api/account.api";

type MeResponse = { roleCode?: string; role?: string };

export function useIsAdmin(): boolean {
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        let alive = true;
        getMe()
            .then((me) => {
                const m = me as MeResponse;
                const code = m.roleCode ?? m.role;
                if (alive) setIsAdmin(code === "ADMIN");
            })
            .catch(() => {
                if (alive) setIsAdmin(false);
            });
        return () => {
            alive = false;
        };
    }, []);
    return isAdmin;
}