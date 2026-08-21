package com.round13.backend.module.loyalty.service;

import com.round13.backend.module.loyalty.domain.LoyaltyAchievementRuleEntity;
import com.round13.backend.module.loyalty.domain.LoyaltyRankRuleEntity;
import com.round13.backend.module.loyalty.dto.LoyaltyAchievementResponse;
import com.round13.backend.module.loyalty.dto.LoyaltyRankResponse;
import com.round13.backend.module.loyalty.repo.LoyaltyAchievementRuleRepository;
import com.round13.backend.module.loyalty.repo.LoyaltyRankRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoyaltyRankService {

    private final LoyaltyRankRuleRepository rankRuleRepository;
    private final LoyaltyAchievementRuleRepository achievementRuleRepository;

    @Transactional(readOnly = true)
    public LoyaltyRankProgress resolveProgress(int totalPoints) {
        List<LoyaltyRankRuleEntity> ranks = rankRuleRepository.findByEnabledTrueOrderByMinPointsAscSortOrderAsc();
        LoyaltyRankRuleEntity current = null;
        LoyaltyRankRuleEntity next = null;
        for (LoyaltyRankRuleEntity rank : ranks) {
            if (rank.getMinPoints() <= totalPoints) {
                current = rank;
            } else {
                next = rank;
                break;
            }
        }

        if (current == null && !ranks.isEmpty()) {
            current = ranks.getFirst();
        }

        Integer pointsToNext = next == null ? null : Math.max(next.getMinPoints() - totalPoints, 0);
        int progressPercent = progressPercent(totalPoints, current, next);
        LoyaltyAchievementRuleEntity achievement = currentAchievement(totalPoints);

        return new LoyaltyRankProgress(current, next, pointsToNext, progressPercent, achievement);
    }

    @Transactional(readOnly = true)
    public LoyaltyRankResponse rankResponse(String code) {
        if (code == null) {
            return null;
        }
        return rankRuleRepository.findByCodeAndEnabledTrue(code)
                .map(this::toRankResponse)
                .orElse(null);
    }

    public LoyaltyRankResponse toRankResponse(LoyaltyRankRuleEntity rank) {
        if (rank == null) {
            return null;
        }
        return new LoyaltyRankResponse(rank.getCode(), rank.getName(), rank.getMinPoints(), rank.isMajor());
    }

    public LoyaltyAchievementResponse toAchievementResponse(LoyaltyAchievementRuleEntity achievement) {
        if (achievement == null) {
            return null;
        }
        return new LoyaltyAchievementResponse(
                achievement.getCode(),
                achievement.getName(),
                achievement.getDescription(),
                achievement.getKind(),
                achievement.getThresholdPoints()
        );
    }

    private LoyaltyAchievementRuleEntity currentAchievement(int totalPoints) {
        return achievementRuleRepository.findByEnabledTrueOrderBySortOrderAsc().stream()
                .filter(rule -> rule.getThresholdPoints() != null)
                .filter(rule -> rule.getThresholdPoints() <= totalPoints)
                .max(Comparator
                        .comparing(LoyaltyAchievementRuleEntity::getThresholdPoints)
                        .thenComparing(LoyaltyAchievementRuleEntity::getSortOrder))
                .orElse(null);
    }

    private int progressPercent(int totalPoints, LoyaltyRankRuleEntity current, LoyaltyRankRuleEntity next) {
        if (current == null) {
            return 0;
        }
        if (next == null) {
            return 100;
        }

        int span = next.getMinPoints() - current.getMinPoints();
        if (span <= 0) {
            return 100;
        }

        int earned = Math.max(totalPoints - current.getMinPoints(), 0);
        return Math.min(100, Math.max(0, (earned * 100) / span));
    }
}
