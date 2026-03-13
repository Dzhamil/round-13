package com.round13.backend.module.training.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Элемент расписания тренера")
public class TrainerScheduleItemResponse {

    @Schema(description = "ID тренировки")
    private UUID sessionId;

    @Schema(description = "ID ученика")
    private UUID studentId;

    @Schema(description = "Имя ученика")
    private String studentName;

    @Schema(description = "Начало тренировки")
    private OffsetDateTime startsAt;

    @Schema(description = "Окончание тренировки")
    private OffsetDateTime endsAt;

    @Schema(description = "Можно ли отменить")
    private boolean canCancel;
}