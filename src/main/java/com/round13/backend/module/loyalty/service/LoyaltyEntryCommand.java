package com.round13.backend.module.loyalty.service;

import com.round13.backend.module.loyalty.domain.LoyaltyPointEntryEntity;
import com.round13.backend.module.loyalty.domain.LoyaltyPointSourceType;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record LoyaltyEntryCommand(
        UUID memberId,
        LoyaltyPointSourceType sourceType,
        int pointsDelta,
        OffsetDateTime eventDate,
        UUID sourceEntityId,
        String sourceEntityType,
        UUID recordedByUserId,
        String reason,
        String ruleCode,
        Integer ruleVersion,
        String idempotencyKey,
        Map<String, Object> metadata,
        LoyaltyPointEntryEntity correctionOfEntry,
        LoyaltyPointEntryEntity revokedEntry
) {
}
