import { useEffect, useState } from "react";
import { getMe } from "../../../shared/api/account.api";
import { hasCoachRole, type RoleAwarePayload } from "../../../shared/lib/roles";

export function useIsCoach(): boolean {

    const [isCoach, setIsCoach] = useState(false);

    useEffect(() => {

        let alive = true;

        getMe()
            .then((me) => {

                const data = me as RoleAwarePayload;

                if (!alive) return;

                setIsCoach(hasCoachRole(data));
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
