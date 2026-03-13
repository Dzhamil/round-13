package com.round13.backend.module.profile.dto;

import com.round13.backend.domain.UserEntitlementEventType;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ProfileGroupEntitlementActivityRow(
        UUID id,
        UserEntitlementEventType eventType,
        String packageTitle,
        String clubEventTitle,
        int delta,
        int balanceAfter,
        OffsetDateTime createdAt
) {
}
