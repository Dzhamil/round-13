package com.round13.backend.module.members.potential.dto;

import java.util.List;

public record BoxerPotentialSummaryResponse(
        BoxerPotentialMeasurementResponse latest,
        List<BoxerPotentialMeasurementResponse> history,
        List<BoxerPotentialChartPointResponse> chart,
        boolean canCreateMeasurement,
        String createBlockedReason
) {}
