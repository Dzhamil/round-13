package com.round13.backend.module.training.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Запрос на создание персональной тренировки")
public class CreatePersonalTrainingRequest {

    @NotNull
    @Schema(description = "ID ученика")
    private UUID studentId;

    @NotNull
    @Future
    @Schema(description = "Дата и время начала тренировки")
    private OffsetDateTime startTime;

    @Positive
    @Schema(description = "Длительность тренировки в минутах")
    private int durationMinutes;
}