package com.round13.backend.module.members.potential;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

@Service
public class BoxerPotentialCalculationService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final BigDecimal PUSH_UPS_NORM = BigDecimal.valueOf(100);
    private static final BigDecimal PULL_UPS_NORM = BigDecimal.valueOf(40);
    private static final BigDecimal JUMP_SQUATS_NORM = BigDecimal.valueOf(80);
    private static final BigDecimal BURPEES_NORM = BigDecimal.valueOf(100);
    private static final BigDecimal PUNCHES_NORM = BigDecimal.valueOf(80);
    private static final BigDecimal ROPE_JUMPS_NORM = BigDecimal.valueOf(220);
    private static final BigDecimal DOUBLE_UNDERS_NORM = BigDecimal.valueOf(110);

    public BoxerPotentialScores calculate(BoxerPotentialRawValues raw, BoxerPotentialNormProfile normProfile) {
        validate(raw);
        Objects.requireNonNull(normProfile, "normProfile must not be null");

        BigDecimal pushUps = score(raw.pushUps90Sec(), PUSH_UPS_NORM);
        BigDecimal pullUps = score(raw.pullUps(), PULL_UPS_NORM);
        BigDecimal jumpSquats = score(raw.jumpSquats90Sec(), JUMP_SQUATS_NORM);
        BigDecimal punchForce = score(raw.punchForceKg(), normProfile.punchForceNorm());
        BigDecimal burpees = score(raw.burpees5Min(), BURPEES_NORM);
        BigDecimal punches = score(raw.punches20Sec(), PUNCHES_NORM);
        BigDecimal ropeJumps = score(raw.ropeJumps60Sec(), ROPE_JUMPS_NORM);
        BigDecimal doubleUnders = score(raw.doubleUnders60Sec(), DOUBLE_UNDERS_NORM);

        BigDecimal strength = average(pushUps, pullUps, jumpSquats, punchForce);
        BigDecimal endurance = burpees;
        BigDecimal speed = punches;
        BigDecimal agility = average(ropeJumps, doubleUnders);
        BigDecimal potential = average(strength, endurance, speed, agility);

        return new BoxerPotentialScores(
                pushUps,
                pullUps,
                jumpSquats,
                punchForce,
                burpees,
                punches,
                ropeJumps,
                doubleUnders,
                strength,
                endurance,
                speed,
                agility,
                potential
        );
    }

    private void validate(BoxerPotentialRawValues raw) {
        if (raw == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        BigDecimal[] values = {
                raw.pushUps90Sec(),
                raw.pullUps(),
                raw.jumpSquats90Sec(),
                raw.punchForceKg(),
                raw.burpees5Min(),
                raw.punches20Sec(),
                raw.ropeJumps60Sec(),
                raw.doubleUnders60Sec()
        };
        for (BigDecimal value : values) {
            if (value == null || value.signum() < 0) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST);
            }
        }
    }

    private BigDecimal score(BigDecimal actualValue, BigDecimal normValue) {
        if (normValue == null || normValue.signum() <= 0) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }
        BigDecimal score = actualValue
                .multiply(HUNDRED)
                .divide(normValue, 4, RoundingMode.HALF_UP);
        if (score.compareTo(HUNDRED) > 0) {
            return HUNDRED.setScale(2, RoundingMode.HALF_UP);
        }
        return score.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal average(BigDecimal... scores) {
        BigDecimal sum = BigDecimal.ZERO;
        for (BigDecimal score : scores) {
            sum = sum.add(score);
        }
        return sum.divide(BigDecimal.valueOf(scores.length), 2, RoundingMode.HALF_UP);
    }
}
