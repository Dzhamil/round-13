package com.round13.backend.module.loyalty.service;

import com.round13.backend.module.loyalty.domain.LoyaltyAchievementRuleEntity;
import com.round13.backend.module.loyalty.domain.LoyaltyRankRuleEntity;
import com.round13.backend.module.loyalty.repo.LoyaltyAchievementRuleRepository;
import com.round13.backend.module.loyalty.repo.LoyaltyRankRuleRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LoyaltyRankServiceTest {

    private final LoyaltyRankRuleRepository rankRepository = mock(LoyaltyRankRuleRepository.class);
    private final LoyaltyAchievementRuleRepository achievementRepository = mock(LoyaltyAchievementRuleRepository.class);
    private final LoyaltyRankService service = new LoyaltyRankService(rankRepository, achievementRepository);

    @Test
    void resolveProgressReturnsCurrentNextAndAchievement() {
        when(rankRepository.findByEnabledTrueOrderByMinPointsAscSortOrderAsc()).thenReturn(List.of(
                rank("rookie", "Новичок", 0, 10),
                rank("steady", "Уверенный участник", 100, 20),
                rank("active", "Актив клуба", 250, 30)
        ));
        when(achievementRepository.findByEnabledTrueOrderBySortOrderAsc()).thenReturn(List.of(
                achievement("points_50", 50, 10),
                achievement("points_150", 150, 20)
        ));

        LoyaltyRankProgress progress = service.resolveProgress(175);

        assertThat(progress.currentRank().getCode()).isEqualTo("steady");
        assertThat(progress.nextRank().getCode()).isEqualTo("active");
        assertThat(progress.pointsToNextRank()).isEqualTo(75);
        assertThat(progress.progressPercent()).isEqualTo(50);
        assertThat(progress.currentAchievement().getCode()).isEqualTo("points_150");
    }

    private LoyaltyRankRuleEntity rank(String code, String name, int minPoints, int sortOrder) {
        LoyaltyRankRuleEntity rank = new LoyaltyRankRuleEntity();
        rank.setCode(code);
        rank.setName(name);
        rank.setMinPoints(minPoints);
        rank.setSortOrder(sortOrder);
        rank.setMajor(true);
        rank.setEnabled(true);
        return rank;
    }

    private LoyaltyAchievementRuleEntity achievement(String code, int threshold, int sortOrder) {
        LoyaltyAchievementRuleEntity achievement = new LoyaltyAchievementRuleEntity();
        achievement.setCode(code);
        achievement.setName(code);
        achievement.setKind("POINTS_THRESHOLD");
        achievement.setThresholdPoints(threshold);
        achievement.setSortOrder(sortOrder);
        achievement.setEnabled(true);
        return achievement;
    }
}
