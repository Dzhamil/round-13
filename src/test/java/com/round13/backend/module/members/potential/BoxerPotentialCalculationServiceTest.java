package com.round13.backend.module.members.potential;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class BoxerPotentialCalculationServiceTest {

    private final BoxerPotentialCalculationService service = new BoxerPotentialCalculationService();

    @Test
    void capsIndividualScoresAt100AndCalculatesAverages() {
        BoxerPotentialScores scores = service.calculate(
                raw(120, 50, 100, 500, 120, 100, 300, 150),
                profile(BoxerPotentialNormSet.MALE, 400)
        );

        assertThat(scores.pushUpsScore()).isEqualByComparingTo("100.00");
        assertThat(scores.pullUpsScore()).isEqualByComparingTo("100.00");
        assertThat(scores.punchForceScore()).isEqualByComparingTo("100.00");
        assertThat(scores.strengthScore()).isEqualByComparingTo("100.00");
        assertThat(scores.potentialScore()).isEqualByComparingTo("100.00");
    }

    @Test
    void usesFemaleChildForceNormForPunchForce() {
        BoxerPotentialScores scores = service.calculate(
                raw(50, 20, 40, 75, 50, 40, 110, 55),
                profile(BoxerPotentialNormSet.FEMALE_CHILD, 150)
        );

        assertThat(scores.punchForceScore()).isEqualByComparingTo("50.00");
        assertThat(scores.strengthScore()).isEqualByComparingTo("50.00");
        assertThat(scores.agilityScore()).isEqualByComparingTo("50.00");
        assertThat(scores.potentialScore()).isEqualByComparingTo("50.00");
    }

    @Test
    void zeroRawValuesProduceZeroScores() {
        BoxerPotentialScores scores = service.calculate(raw(0, 0, 0, 0, 0, 0, 0, 0), profile(BoxerPotentialNormSet.MALE, 400));

        assertThat(scores.potentialScore()).isEqualByComparingTo("0.00");
    }

    private BoxerPotentialRawValues raw(
            double pushUps,
            double pullUps,
            double jumpSquats,
            double punchForce,
            double burpees,
            double punches,
            double ropeJumps,
            double doubleUnders
    ) {
        return new BoxerPotentialRawValues(
                BigDecimal.valueOf(pushUps),
                BigDecimal.valueOf(pullUps),
                BigDecimal.valueOf(jumpSquats),
                BigDecimal.valueOf(punchForce),
                BigDecimal.valueOf(burpees),
                BigDecimal.valueOf(punches),
                BigDecimal.valueOf(ropeJumps),
                BigDecimal.valueOf(doubleUnders)
        );
    }

    private BoxerPotentialNormProfile profile(BoxerPotentialNormSet normSet, int forceNorm) {
        BoxerPotentialNormGroup group = normSet == BoxerPotentialNormSet.MALE
                ? BoxerPotentialNormGroup.MALE_16_PLUS
                : BoxerPotentialNormGroup.FEMALE;
        return new BoxerPotentialNormProfile(group, normSet, 20, "MALE", BigDecimal.valueOf(forceNorm));
    }
}
