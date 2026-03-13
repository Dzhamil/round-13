import { useEffect, useState } from "react";
import { getMe } from "../../../shared/api/account.api";

type MeResponse = {
    roleCode?: string;
    role?: string;
};

export function useIsCoach(): boolean {

    const [isCoach, setIsCoach] = useState(false);

    useEffect(() => {

        let alive = true;

        getMe()
            .then((me) => {

                const data = me as MeResponse;
                const roleCode = data.roleCode ?? data.role;

                if (!alive) return;

                setIsCoach(roleCode === "COACH" || roleCode === "ADMIN");
            })
            .catch(() => {
                if (!alive) return;
                setIsCoach(false);
            });

        return () => {
            alive = false;
        };

    }, []);

    return isCoach;
}