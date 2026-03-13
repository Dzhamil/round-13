package com.round13.backend.module.training.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Элемент личного расписания пользователя: тренировка, на которую он записан.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Элемент личного расписания пользователя (тренировка, на которую он записан)")
public class MyScheduleItemResponse {

    @Schema(description = "ID тренировки", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    private UUID sessionId;

    @Schema(description = "Название/заголовок тренировки", example = "Группа · Тимур", nullable = true)
    private String title;

    @Schema(description = "Тип тренировки (GROUP/PERSONAL/OPEN)", example = "GROUP")
    private String type;

    @Schema(description = "Дата и время начала (ISO-8601)", example = "2026-02-11T18:00:00+03:00")
    private OffsetDateTime startsAt;

    @Schema(description = "Дата и время окончания (ISO-8601)", example = "2026-02-11T19:30:00+03:00", nullable = true)
    private OffsetDateTime endsAt;

    @Schema(description = "ID тренера/организатора", example = "3fa85f64-5717-4562-b3fc-2c963f66afa7", nullable = true)
    private UUID coachId;

    @Schema(description = "Имя тренера/организатора", example = "Тимур", nullable = true)
    private String coachName;

    @Schema(description = "URL аватара тренера/организатора", nullable = true)
    private String coachAvatarUrl;

    @Schema(description = "Место проведения", example = "Зал Round 13", nullable = true)
    private String location;

    @Schema(description = "Статус участия в тренировке", example = "BOOKED")
    private String status;

    @Schema(description = "Можно ли отменить запись (например, если тренировка ещё не началась)", example = "true")
    private boolean canCancel;
}
