package com.round13.backend.module.loyalty.dto;

public record LoyaltyRankResponse(
        String code,
        String name,
        int minPoints,
        boolean major
) {
}
