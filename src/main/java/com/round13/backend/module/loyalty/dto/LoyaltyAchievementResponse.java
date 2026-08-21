package com.round13.backend.module.loyalty.dto;

public record LoyaltyAchievementResponse(
        String code,
        String name,
        String description,
        String kind,
        Integer thresholdPoints
) {
}
