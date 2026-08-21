package com.round13.backend.module.loyalty.dto;

public record LoyaltySummaryResponse(
        int totalPoints,
        int positivePoints,
        int negativePoints,
        LoyaltyRankResponse currentRank,
        LoyaltyRankResponse nextRank,
        Integer pointsToNextRank,
        int progressPercent,
        LoyaltyAchievementResponse currentAchievement
) {
}
