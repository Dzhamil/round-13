package com.round13.backend.module.info.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO для отображения тренировки/мероприятия в афише.
 */
@Schema(description = "Тренировка/мероприятие в афише")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrainingSessionResponse {

    @Schema(description = "Идентификатор тренировки", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    private UUID id;

    @Schema(description = "Название", example = "Групповая тренировка")
    private String title;

    @Schema(description = "Описание (может быть null)", example = "Техника, ОФП, работа на мешках", nullable = true)
    private String description;

    @Schema(description = "Тип тренировки (GROUP/PERSONAL/OPEN)", example = "GROUP")
    private String type;

    @Schema(description = "Дата и время начала", example = "2026-02-11T18:30:00+03:00")
    private OffsetDateTime startTime;

    @Schema(description = "Длительность в минутах", example = "90")
    private Integer durationMinutes;

    @Schema(description = "Вместимость (null = без лимита)", example = "30", nullable = true)
    private Integer capacity;

    @Schema(description = "Место проведения", example = "Зал Round 13")
    private String location;

    @Schema(description = "Идентификатор тренера/организатора (может быть null)", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6", nullable = true)
    private UUID coachUserId;

    @Schema(description = "Имя/ник тренера (если доступно; может быть null)", example = "Тимур", nullable = true)
    private String coachName;

    @Schema(description = "Сколько участников уже записано", example = "12")
    private Long participantsCount;
}
