// src/main/java/com/round13/backend/module/members/dto/MemberRoleGroup.java
package com.round13.backend.module.members.dto;

/**
 * Группа участников для ветвления логики статусов.
 *
 * FIGHTER = не тренеры и не админы
 * COACH_STAFF = тренеры + админы
 */
public enum MemberRoleGroup {
    FIGHTER,
    COACH_STAFF;

    public static MemberRoleGroup fromRoleCode(String roleCodeRaw) {
        MemberRoleCode role = MemberRoleCode.fromOrNull(roleCodeRaw);
        if (role == MemberRoleCode.COACH || role == MemberRoleCode.ADMIN) {
            return COACH_STAFF;
        }
        return FIGHTER;
    }
}
