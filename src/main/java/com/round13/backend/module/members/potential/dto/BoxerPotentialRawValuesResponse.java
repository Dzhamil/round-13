package com.round13.backend.module.members.potential.dto;

import java.math.BigDecimal;

public record BoxerPotentialRawValuesResponse(
        BigDecimal pushUps90Sec,
        BigDecimal pullUps,
        BigDecimal jumpSquats90Sec,
        BigDecimal punchForceKg,
        BigDecimal burpees5Min,
        BigDecimal punches20Sec,
        BigDecimal ropeJumps60Sec,
        BigDecimal doubleUnders60Sec
) {}
