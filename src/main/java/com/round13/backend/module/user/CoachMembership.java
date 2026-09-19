package com.round13.backend.module.user;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatus;

/** The club roster includes business administrators, independently of profile completion. */
public final class CoachMembership {
    public static final String ROLE_PREDICATE = "r.code in ('COACH', 'ADMIN')";

    private CoachMembership() {}

    public static boolean includes(UserEntity user) {
        return user.getStatus() != UserStatus.DELETED && user.getRole() != null
                && includesRole(user.getRole().getCode());
    }

    public static boolean includesRole(String role) {
        return UserRoleCodes.COACH.equals(role) || UserRoleCodes.ADMIN.equals(role);
    }
}
