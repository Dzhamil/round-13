package com.round13.backend.module.loyalty.dto;

import com.round13.backend.module.loyalty.domain.LoyaltyPointSourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record ManualPointAwardRequest(
        @NotNull UUID memberId,
        @NotNull LoyaltyPointSourceType sourceType,
        String ruleCode,
        Integer pointsDelta,
        OffsetDateTime eventDate,
        UUID sourceEntityId,
        @Size(max = 64) String sourceEntityType,
        @NotBlank @Size(max = 512) String reason,
        Map<String, Object> metadata
) {
}
