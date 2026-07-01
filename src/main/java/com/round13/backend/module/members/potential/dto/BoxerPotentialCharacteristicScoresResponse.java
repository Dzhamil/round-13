package com.round13.backend.module.members.potential.dto;

import java.math.BigDecimal;

public record BoxerPotentialCharacteristicScoresResponse(
        BigDecimal strength,
        BigDecimal endurance,
        BigDecimal speed,
        BigDecimal agility
) {}
