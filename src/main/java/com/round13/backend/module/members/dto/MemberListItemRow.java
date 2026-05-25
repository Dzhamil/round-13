package com.round13.backend.module.members.dto;

import java.util.UUID;

/**
 * Read-model строка для списка участников (результат select new ...).
 * Используется только для выборок списка, не для внешнего API.
 */
public record MemberListItemRow(
        UUID id,
        String nickname,
        String phone,
        String avatarUrl,
        Integer points,
        String statusLabel,
        String roleCode,
        Integer remainingTrainings,
        UUID trainerStudentLinkId,
        UUID trainerId,
        String trainerName
) {
    public MemberListItemRow(
            UUID id,
            String nickname,
            String phone,
            String avatarUrl,
            Integer points,
            String statusLabel,
            String roleCode,
            Integer remainingTrainings
    ) {
        this(id, nickname, phone, avatarUrl, points, statusLabel, roleCode, remainingTrainings, null, null, null);
    }

    public MemberListItemRow(
            UUID id,
            String nickname,
            String phone,
            String avatarUrl,
            Integer points,
            String statusLabel,
            String roleCode
    ) {
        this(id, nickname, phone, avatarUrl, points, statusLabel, roleCode, null, null, null, null);
    }
}
