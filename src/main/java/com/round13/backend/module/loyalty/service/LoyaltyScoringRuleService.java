package com.round13.backend.module.loyalty.service;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.loyalty.domain.LoyaltyPointSourceType;
import com.round13.backend.module.loyalty.domain.LoyaltyScoringRuleEntity;
import com.round13.backend.module.loyalty.repo.LoyaltyScoringRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LoyaltyScoringRuleService {

    private final LoyaltyScoringRuleRepository scoringRuleRepository;

    @Transactional(readOnly = true)
    public LoyaltyScoringRuleEntity getActiveRule(String code) {
        if (code == null || code.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        return scoringRuleRepository.findByCodeAndEnabledTrueAndValidToIsNull(code)
                .orElseThrow(() -> new BusinessException(ErrorCode.LOYALTY_RULE_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public int fixedPoints(String code) {
        return intValue(getActiveRule(code).getConfig(), "points");
    }

    @Transactional(readOnly = true)
    public int placementPoints(String code, int place) {
        LoyaltyScoringRuleEntity rule = getActiveRule(code);
        Map<String, Object> config = rule.getConfig();

        Object explicitPlaces = config.get("places");
        if (explicitPlaces instanceof Map<?, ?> places) {
            Object raw = places.get(String.valueOf(place));
            if (raw == null) {
                raw = places.get(place);
            }
            if (raw instanceof Number number) {
                return number.intValue();
            }
        }

        int minPlace = intValue(config, "minPlace");
        int maxPlace = intValue(config, "maxPlace");
        if (place < minPlace || place > maxPlace) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        int firstPlacePoints = intValue(config, "firstPlacePoints");
        int step = intValue(config, "step");
        return firstPlacePoints + ((place - minPlace) * step);
    }

    @Transactional(readOnly = true)
    public int fitnessImprovementPoints(double improvementPercent) {
        LoyaltyScoringRuleEntity rule = getActiveRule(LoyaltyRuleCodes.FITNESS_NORM_IMPROVEMENT);
        Object tiersValue = rule.getConfig().get("tiers");
        if (!(tiersValue instanceof List<?> tiers)) {
            throw new BusinessException(ErrorCode.LOYALTY_RULE_INVALID);
        }

        for (Object item : tiers) {
            if (!(item instanceof Map<?, ?> tier)) {
                continue;
            }

            double min = doubleValue(tier, "min", Double.NEGATIVE_INFINITY);
            double max = doubleValue(tier, "max", Double.POSITIVE_INFINITY);
            if (improvementPercent >= min && improvementPercent <= max) {
                return intValue(tier, "points");
            }
        }

        throw new BusinessException(ErrorCode.INVALID_REQUEST);
    }

    @Transactional(readOnly = true)
    public int boxingMatchPoints(int rounds, String outcomeRaw) {
        if (outcomeRaw == null || outcomeRaw.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        LoyaltyScoringRuleEntity rule = getActiveRule(LoyaltyRuleCodes.BOXING_MATCH_RESULT);
        Object roundsConfig = rule.getConfig().get("rounds");
        if (!(roundsConfig instanceof Map<?, ?> roundsMap)) {
            throw new BusinessException(ErrorCode.LOYALTY_RULE_INVALID);
        }

        Object outcomeConfig = roundsMap.get(String.valueOf(rounds));
        if (!(outcomeConfig instanceof Map<?, ?> outcomeMap)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        Object points = outcomeMap.get(outcomeRaw.trim().toUpperCase());
        if (!(points instanceof Number number)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        return number.intValue();
    }

    @Transactional(readOnly = true)
    public LoyaltyPointSourceType sourceTypeForRule(String code) {
        return getActiveRule(code).getSourceType();
    }

    public int intValue(Map<?, ?> config, String key) {
        Object value = config.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        throw new BusinessException(ErrorCode.LOYALTY_RULE_INVALID);
    }

    private double doubleValue(Map<?, ?> config, String key, double defaultValue) {
        Object value = config.get(key);
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        throw new BusinessException(ErrorCode.LOYALTY_RULE_INVALID);
    }
}
