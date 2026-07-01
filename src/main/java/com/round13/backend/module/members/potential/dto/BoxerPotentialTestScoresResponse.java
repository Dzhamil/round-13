package com.round13.backend.module.members.potential.dto;

import java.math.BigDecimal;

public record BoxerPotentialTestScoresResponse(
        BigDecimal pushUpsScore,
        BigDecimal pullUpsScore,
        BigDecimal jumpSquatsScore,
        BigDecimal punchForceScore,
        BigDecimal burpeesScore,
        BigDecimal punchesScore,
        BigDecimal ropeJumpsScore,
        BigDecimal doubleUndersScore
) {}
