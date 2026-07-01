package com.round13.backend.module.members.potential.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BoxerPotentialLeaderboardItemResponse(
        int place,
        UUID memberId,
        String nickname,
        String avatarUrl,
        OffsetDateTime measuredAt,
        BigDecimal potentialScore,
        BigDecimal strengthScore,
        BigDecimal enduranceScore,
        BigDecimal speedScore,
        BigDecimal agilityScore
) {}
