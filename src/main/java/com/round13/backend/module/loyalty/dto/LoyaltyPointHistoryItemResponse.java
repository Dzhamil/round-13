package com.round13.backend.module.loyalty.dto;

import com.round13.backend.module.loyalty.domain.LoyaltyPointSourceType;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record LoyaltyPointHistoryItemResponse(
        UUID id,
        LoyaltyPointSourceType sourceType,
        int pointsDelta,
        OffsetDateTime eventDate,
        UUID sourceEntityId,
        String sourceEntityType,
        UUID recordedByUserId,
        String reason,
        String ruleCode,
        Integer ruleVersion,
        Map<String, Object> metadata,
        UUID correctionOfEntryId,
        UUID revokedEntryId
) {
}
