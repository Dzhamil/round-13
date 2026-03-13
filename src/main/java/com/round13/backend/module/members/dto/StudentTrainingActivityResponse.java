package com.round13.backend.module.members.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Краткая информация о тренировке ученика")
public class StudentTrainingActivityResponse {

    @Schema(description = "ID тренировки", example = "550e8400-e29b-41d4-a716-446655440000")
    private String id;

    @Schema(description = "Название тренировки")
    private String title;

    @Schema(description = "Дата и время начала")
    private OffsetDateTime startTime;

    @Schema(description = "Длительность в минутах", example = "60")
    private int durationMinutes;

    @Schema(description = "Локация", nullable = true)
    private String location;

    @Schema(description = "Статус участия", example = "ATTENDED")
    private String participantStatus;
}
