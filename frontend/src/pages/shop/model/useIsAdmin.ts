import { useEffect, useState } from "react";
import { getMe } from "../../../shared/api/account.api";
import { getAccessToken } from "../../../shared/lib/tokens";

type MeResponse = {
    roleCode?: string;
    role?: string;
    roles?: string[];
    authorities?: string[];
};

export function useIsAdmin(): boolean {
    const [isAdmin, setIsAdmin] = useState(() => hasAdminRoleInToken());

    useEffect(() => {
        let alive = true;

        getMe()
            .then((me) => {
                if (!alive) return;
                setIsAdmin(hasAdminRole(me) || hasAdminRoleInToken());
            })
            .catch(() => {
                if (!alive) return;
                setIsAdmin(hasAdminRoleInToken());
            });

        return () => {
            alive = false;
        };
    }, []);

    return isAdmin;
}

function hasAdminRole(value: MeResponse): boolean {
    return hasAdminValue([
        value.roleCode,
        value.role,
        ...(value.roles ?? []),
        ...(value.authorities ?? []),
    ]);
}

function hasAdminRoleInToken(): boolean {
    const token = getAccessToken();
    if (!token) return false;

    try {
        const [, payload] = token.split(".");
        if (!payload) return false;

        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
        const claims = JSON.parse(atob(padded)) as MeResponse;

        return hasAdminRole(claims);
    } catch {
        return false;
    }
}

function hasAdminValue(values: Array<string | undefined>): boolean {
    return values.some((value) => {
        if (!value) return false;
        const normalized = value.toUpperCase().replace(/^ROLE_/, "");
        return normalized === "ADMIN";
    });
}
