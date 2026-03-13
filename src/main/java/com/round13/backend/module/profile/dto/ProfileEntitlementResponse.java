package com.round13.backend.module.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

/**
 * Короткое представление активной услуги/пакета пользователя для профиля.
 */
@Schema(description = "Короткая карточка активной услуги пользователя")
public record ProfileEntitlementResponse(
        @Schema(description = "Идентификатор записи", example = "550e8400-e29b-41d4-a716-446655440000")
        String id,
        @Schema(description = "Тип пакета", example = "PERSONAL_TRAININGS")
        String type,
        @Schema(description = "Заголовок пакета", example = "Персональный пакет тренировок")
        String title,
        @Schema(description = "Краткое описание остатка", example = "Тренер: Иван Петров. Осталось тренировок: 3")
        String subtitle,
        @Schema(description = "Где и как можно тратить пакет", example = "Списывается на персональной тренировке у выбранного тренера")
        String usageHint,
        @Schema(description = "Остаток тренировок в пакете", example = "3")
        int remainingQuantity,
        @Schema(description = "Срок действия пакета, если ограничен", example = "2026-04-20T00:00:00+03:00", nullable = true)
        OffsetDateTime expiresAt
) {
}
