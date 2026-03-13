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
@Schema(description = "Событие журнала баланса тренировок")
public class TrainingBalanceHistoryItemResponse {

    @Schema(description = "ID события", example = "550e8400-e29b-41d4-a716-446655440000")
    private String id;

    @Schema(description = "ID ученика", example = "550e8400-e29b-41d4-a716-446655440001")
    private String studentId;

    @Schema(description = "Имя ученика", example = "Илья")
    private String studentName;

    @Schema(description = "Изменение остатка тренировок", example = "-1")
    private int delta;

    @Schema(description = "Остаток после изменения", example = "7")
    private int balanceAfter;

    @Schema(description = "Тип события", example = "MANUAL_DEBIT")
    private String eventType;

    @Schema(description = "ID пользователя, создавшего событие", example = "550e8400-e29b-41d4-a716-446655440002")
    private String createdByUserId;

    @Schema(description = "Имя пользователя, создавшего событие", example = "Тренер")
    private String createdByName;

    @Schema(description = "Дата и время события", example = "2026-03-13T18:15:00+03:00")
    private OffsetDateTime createdAt;
}
