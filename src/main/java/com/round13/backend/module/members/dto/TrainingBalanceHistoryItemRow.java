package com.round13.backend.module.members.dto;

import com.round13.backend.domain.TrainingBalanceEventType;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Read-model строка для журнала изменений баланса тренировок.
 */
public record TrainingBalanceHistoryItemRow(
        UUID id,
        UUID studentId,
        String studentName,
        Integer delta,
        Integer balanceAfter,
        TrainingBalanceEventType eventType,
        UUID createdByUserId,
        String createdByName,
        OffsetDateTime createdAt
) {
}
