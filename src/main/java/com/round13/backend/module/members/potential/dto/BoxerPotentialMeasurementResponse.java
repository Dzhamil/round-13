package com.round13.backend.module.members.potential.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BoxerPotentialMeasurementResponse(
        UUID id,
        UUID memberId,
        OffsetDateTime measuredAt,
        OffsetDateTime createdAt,
        UUID createdByUserId,
        String createdByName,
        String normGroup,
        String normGroupLabel,
        String normSet,
        int ageAtMeasurement,
        String genderAtMeasurement,
        BoxerPotentialRawValuesResponse raw,
        BoxerPotentialTestScoresResponse testScores,
        BoxerPotentialCharacteristicScoresResponse characteristicScores,
        BigDecimal potentialScore
) {}
