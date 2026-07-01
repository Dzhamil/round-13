package com.round13.backend.module.members.potential;

import java.math.BigDecimal;

public record BoxerPotentialNormProfile(
        BoxerPotentialNormGroup normGroup,
        BoxerPotentialNormSet normSet,
        int ageAtMeasurement,
        String genderAtMeasurement,
        BigDecimal punchForceNorm
) {
    public String normGroupLabel() {
        return normGroup.getLabel();
    }
}
