import { useEffect, useState } from "react";
import { getMe } from "../../../shared/api/account.api";
import { hasAdminRole, hasCoachRole, type RoleAwarePayload } from "../../../shared/lib/roles";

type MemberRoleFlags = {
    isAdmin: boolean
    isCoach: boolean
}

const DEFAULT_FLAGS: MemberRoleFlags = {
    isAdmin: false,
    isCoach: false,
};

export function useMemberRoleFlags(): MemberRoleFlags {
    const [flags, setFlags] = useState<MemberRoleFlags>(DEFAULT_FLAGS);

    useEffect(() => {
        let alive = true;

        getMe()
            .then((me) => {
                if (!alive) {
                    return;
                }

                const data = me as RoleAwarePayload;
                setFlags({
                    isAdmin: hasAdminRole(data),
                    isCoach: hasCoachRole(data),
                });
            })
            .catch(() => {
                if (!alive) {
                    return;
                }

                setFlags(DEFAULT_FLAGS);
            });

        return () => {
            alive = false;
        };
    }, []);

    return flags;
}
