// src/main/java/com/round13/backend/module/members/dto/MemberRoleCode.java
package com.round13.backend.module.members.dto;

/**
 * Роли пользователя (то, что реально хранится в RoleEntity.code).
 */
public enum MemberRoleCode {
    ATHLETE,
    COACH,
    ADMIN;

    public static MemberRoleCode fromOrNull(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return MemberRoleCode.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
