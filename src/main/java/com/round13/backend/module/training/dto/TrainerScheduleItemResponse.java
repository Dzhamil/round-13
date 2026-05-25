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

    @Schema(description = "Название/заголовок тренировки", example = "Персональная техника", nullable = true)
    private String title;

    @Schema(description = "ID ученика")
    private UUID studentId;

    @Schema(description = "Имя ученика")
    private String studentName;

    @Schema(description = "Начало тренировки")
    private OffsetDateTime startsAt;

    @Schema(description = "Окончание тренировки")
    private OffsetDateTime endsAt;

    @Schema(description = "Место проведения", example = "Зал Round 13", nullable = true)
    private String location;

    @Schema(description = "Статус участия ученика", example = "BOOKED")
    private String status;

    @Schema(description = "Можно ли тренеру подтвердить запрос на отмену")
    private boolean canConfirmCancellation;

    @Schema(description = "Можно ли тренеру отметить посещение")
    private boolean canMarkAttended;

    @Schema(description = "Можно ли тренеру отметить неявку")
    private boolean canMarkNoShow;

    @Schema(description = "Можно ли тренеру отменить тренировку без списания лимита")
    private boolean canCancelByTrainer;
}
