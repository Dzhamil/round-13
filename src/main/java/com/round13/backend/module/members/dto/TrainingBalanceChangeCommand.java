package com.round13.backend.module.members.dto;

import com.round13.backend.domain.TrainingBalanceEventType;

import java.util.UUID;

/**
 * Внутренний DTO для операций начисления/списания баланса тренировок.
 */
public record TrainingBalanceChangeCommand(
        UUID trainerId,
        UUID studentId,
        int quantity,
        TrainingBalanceEventType eventType,
        UUID createdByUserId
) {
}
