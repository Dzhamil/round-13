package com.round13.backend.module.members.potential.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record BoxerPotentialMeasurementRequest(
        @NotNull OffsetDateTime measuredAt,
        @NotNull @DecimalMin("0.00") BigDecimal pushUps90Sec,
        @NotNull @DecimalMin("0.00") BigDecimal pullUps,
        @NotNull @DecimalMin("0.00") BigDecimal jumpSquats90Sec,
        @NotNull @DecimalMin("0.00") BigDecimal punchForceKg,
        @NotNull @DecimalMin("0.00") BigDecimal burpees5Min,
        @NotNull @DecimalMin("0.00") BigDecimal punches20Sec,
        @NotNull @DecimalMin("0.00") BigDecimal ropeJumps60Sec,
        @NotNull @DecimalMin("0.00") BigDecimal doubleUnders60Sec
) {}
