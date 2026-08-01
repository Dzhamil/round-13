package com.round13.backend.module.loyalty.dto;

import java.util.UUID;

public record LoyaltyLeaderboardItemResponse(
        int place,
        UUID memberId,
        String nickname,
        int totalPoints,
        LoyaltyRankResponse rank
) {
}
