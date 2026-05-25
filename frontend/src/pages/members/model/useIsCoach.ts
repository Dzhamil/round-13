import { useMemberRoleFlags } from "./useMemberRoleFlags";

export function useIsCoach(): boolean {
    const { isCoach } = useMemberRoleFlags();
    return isCoach;
}
