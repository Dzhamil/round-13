package com.round13.backend.module.loyalty.service;

import com.round13.backend.module.loyalty.domain.LoyaltyPointSourceType;
import com.round13.backend.module.loyalty.domain.LoyaltyScoringRuleEntity;
import com.round13.backend.module.loyalty.repo.LoyaltyScoringRuleRepository;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LoyaltyScoringRuleServiceTest {

    private final LoyaltyScoringRuleRepository repository = mock(LoyaltyScoringRuleRepository.class);
    private final LoyaltyScoringRuleService service = new LoyaltyScoringRuleService(repository);

    @Test
    void placementPointsUsesDescendingRule() {
        givenRule("monthly.complex.placement", LoyaltyPointSourceType.MONTHLY_COMPLEX_PLACEMENT, Map.of(
                "minPlace", 1,
                "maxPlace", 10,
                "firstPlacePoints", 100,
                "step", -10
        ));

        assertThat(service.placementPoints("monthly.complex.placement", 1)).isEqualTo(100);
        assertThat(service.placementPoints("monthly.complex.placement", 7)).isEqualTo(40);
        assertThat(service.placementPoints("monthly.complex.placement", 10)).isEqualTo(10);
    }

    @Test
    void boxingMatchPointsUsesRoundsAndOutcomeMap() {
        givenRule("boxing.match.result", LoyaltyPointSourceType.BOXING_MATCH, Map.of(
                "rounds", Map.of(
                        "3", Map.of("WIN", 100, "LOSS", 50),
                        "4", Map.of("WIN", 200, "LOSS", 100),
                        "6", Map.of("WIN", 500, "LOSS", 250)
                )
        ));

        assertThat(service.boxingMatchPoints(3, "win")).isEqualTo(100);
        assertThat(service.boxingMatchPoints(4, "LOSS")).isEqualTo(100);
        assertThat(service.boxingMatchPoints(6, "loss")).isEqualTo(250);
    }

    @Test
    void fitnessImprovementUsesConfiguredTiers() {
        givenRule("fitness.norm.improvement", LoyaltyPointSourceType.FITNESS_NORM_IMPROVEMENT, Map.of(
                "tiers", List.of(
                        Map.of("min", 0, "max", 20, "points", 2),
                        Map.of("min", 21, "max", 30, "points", 4),
                        Map.of("min", 31, "points", 6)
                )
        ));

        assertThat(service.fitnessImprovementPoints(20)).isEqualTo(2);
        assertThat(service.fitnessImprovementPoints(25)).isEqualTo(4);
        assertThat(service.fitnessImprovementPoints(31)).isEqualTo(6);
    }

    private void givenRule(String code, LoyaltyPointSourceType sourceType, Map<String, Object> config) {
        LoyaltyScoringRuleEntity rule = new LoyaltyScoringRuleEntity();
        rule.setCode(code);
        rule.setSourceType(sourceType);
        rule.setVersion(1);
        rule.setEnabled(true);
        rule.setConfig(new LinkedHashMap<>(config));
        when(repository.findByCodeAndEnabledTrueAndValidToIsNull(code)).thenReturn(Optional.of(rule));
    }
}
