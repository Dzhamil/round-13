package com.round13.backend.module.members.potential;

import java.math.BigDecimal;

public record BoxerPotentialScores(
        BigDecimal pushUpsScore,
        BigDecimal pullUpsScore,
        BigDecimal jumpSquatsScore,
        BigDecimal punchForceScore,
        BigDecimal burpeesScore,
        BigDecimal punchesScore,
        BigDecimal ropeJumpsScore,
        BigDecimal doubleUndersScore,
        BigDecimal strengthScore,
        BigDecimal enduranceScore,
        BigDecimal speedScore,
        BigDecimal agilityScore,
        BigDecimal potentialScore
) {}
