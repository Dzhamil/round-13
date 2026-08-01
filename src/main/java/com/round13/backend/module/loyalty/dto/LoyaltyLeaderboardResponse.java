package com.round13.backend.module.loyalty.dto;

import java.util.List;

public record LoyaltyLeaderboardResponse(
        List<LoyaltyLeaderboardItemResponse> items
) {
}
