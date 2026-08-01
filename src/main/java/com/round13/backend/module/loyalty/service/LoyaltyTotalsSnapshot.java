package com.round13.backend.module.loyalty.service;

public record LoyaltyTotalsSnapshot(
        int totalPoints,
        int positivePoints,
        int negativePoints,
        LoyaltyRankProgress rankProgress
) {
}
