package com.round13.backend.module.profile.dto;

import com.round13.backend.domain.TrainingBalanceEventType;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ProfilePersonalEntitlementActivityRow(
        UUID id,
        String trainerName,
        TrainingBalanceEventType eventType,
        int delta,
        int balanceAfter,
        OffsetDateTime createdAt
) {
}
