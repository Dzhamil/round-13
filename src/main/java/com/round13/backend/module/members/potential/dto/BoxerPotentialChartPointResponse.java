package com.round13.backend.module.members.potential.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record BoxerPotentialChartPointResponse(
        OffsetDateTime measuredAt,
        BigDecimal potentialScore,
        BigDecimal strengthScore,
        BigDecimal enduranceScore,
        BigDecimal speedScore,
        BigDecimal agilityScore
) {}
