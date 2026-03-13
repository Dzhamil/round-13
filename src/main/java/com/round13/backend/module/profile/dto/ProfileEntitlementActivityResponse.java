package com.round13.backend.module.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

@Schema(description = "Событие активности по пакету тренировок пользователя")
public record ProfileEntitlementActivityResponse(
        @Schema(description = "Идентификатор записи активности")
        String id,
        @Schema(description = "Заголовок события", example = "Запись на групповую тренировку")
        String title,
        @Schema(description = "Дополнительный контекст", nullable = true, example = "Тренировка ОФП")
        String subtitle,
        @Schema(description = "Изменение остатка", example = "-1")
        int delta,
        @Schema(description = "Остаток после операции", example = "3")
        int balanceAfter,
        @Schema(description = "Дата и время операции", example = "2026-03-14T18:30:00+03:00")
        OffsetDateTime occurredAt
) {
}
