package com.round13.backend.module.loyalty.service;

import com.round13.backend.module.loyalty.domain.LoyaltyAchievementRuleEntity;
import com.round13.backend.module.loyalty.domain.LoyaltyRankRuleEntity;

public record LoyaltyRankProgress(
        LoyaltyRankRuleEntity currentRank,
        LoyaltyRankRuleEntity nextRank,
        Integer pointsToNextRank,
        int progressPercent,
        LoyaltyAchievementRuleEntity currentAchievement
) {
}
