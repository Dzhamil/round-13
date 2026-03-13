const ADMIN_ROLE = "ADMIN";
const COACH_ROLE = "COACH";

export type RoleAwarePayload = {
    roleCode?: string | null;
    role?: string | null;
    roles?: string[] | null;
    authorities?: string[] | null;
};

export function normalizeRoleValue(value: string): string {
    return value.toUpperCase().replace(/^ROLE_/, "");
}

export function hasRoleValue(values: Array<string | null | undefined>, expectedRole: string): boolean {
    return values.some((value) => !!value && normalizeRoleValue(value) === expectedRole);
}

export function isAdminRole(value: string | null | undefined): boolean {
    return !!value && normalizeRoleValue(value) === ADMIN_ROLE;
}

export function isCoachRole(value: string | null | undefined): boolean {
    if (!value) {
        return false;
    }

    const normalized = normalizeRoleValue(value);
    return normalized === COACH_ROLE || normalized === ADMIN_ROLE;
}

export function hasAdminRole(payload: RoleAwarePayload): boolean {
    return hasRoleValue([
        payload.roleCode,
        payload.role,
        ...(payload.roles ?? []),
        ...(payload.authorities ?? []),
    ], ADMIN_ROLE);
}

export function hasCoachRole(payload: RoleAwarePayload): boolean {
    return [payload.roleCode, payload.role, ...(payload.roles ?? []), ...(payload.authorities ?? [])]
        .some((value) => isCoachRole(value));
}
