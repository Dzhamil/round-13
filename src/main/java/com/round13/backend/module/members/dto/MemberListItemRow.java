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
        boolean phoneHidden,
        String avatarUrl,
        Integer points,
        String statusLabel,
        String roleCode,
        Integer remainingTrainings
) {
    public MemberListItemRow(
            UUID id,
            String nickname,
            String phone,
            boolean phoneHidden,
            String avatarUrl,
            Integer points,
            String statusLabel,
            String roleCode
    ) {
        this(id, nickname, phone, phoneHidden, avatarUrl, points, statusLabel, roleCode, null);
    }
}
