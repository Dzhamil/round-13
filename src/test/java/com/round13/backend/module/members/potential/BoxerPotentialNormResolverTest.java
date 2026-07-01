package com.round13.backend.module.members.potential;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BoxerPotentialNormResolverTest {

    private final BoxerPotentialNormResolver resolver = new BoxerPotentialNormResolver();

    @Test
    void maleAge16UsesMaleNormSetAnd400KgForceNorm() {
        BoxerPotentialNormProfile profile = resolver.resolve(profile("MALE", LocalDate.of(2010, 7, 1)), LocalDate.of(2026, 7, 1));

        assertThat(profile.normGroup()).isEqualTo(BoxerPotentialNormGroup.MALE_16_PLUS);
        assertThat(profile.normSet()).isEqualTo(BoxerPotentialNormSet.MALE);
        assertThat(profile.punchForceNorm()).isEqualByComparingTo("400");
    }

    @Test
    void maleUnder16IsChildAndUses150KgForceNorm() {
        BoxerPotentialNormProfile profile = resolver.resolve(profile("MALE", LocalDate.of(2011, 7, 2)), LocalDate.of(2026, 7, 1));

        assertThat(profile.normGroup()).isEqualTo(BoxerPotentialNormGroup.CHILD);
        assertThat(profile.normSet()).isEqualTo(BoxerPotentialNormSet.FEMALE_CHILD);
        assertThat(profile.punchForceNorm()).isEqualByComparingTo("150");
    }

    @Test
    void femaleAge16UsesFemaleGroupAnd150KgForceNorm() {
        BoxerPotentialNormProfile profile = resolver.resolve(profile("FEMALE", LocalDate.of(2000, 1, 1)), LocalDate.of(2026, 7, 1));

        assertThat(profile.normGroup()).isEqualTo(BoxerPotentialNormGroup.FEMALE);
        assertThat(profile.normSet()).isEqualTo(BoxerPotentialNormSet.FEMALE_CHILD);
        assertThat(profile.punchForceNorm()).isEqualByComparingTo("150");
    }

    @Test
    void missingBirthDateBlocksMeasurement() {
        ProfileEntity profile = profile("MALE", null);

        assertThatThrownBy(() -> resolver.resolve(profile, LocalDate.of(2026, 7, 1)))
                .isInstanceOfSatisfying(BusinessException.class, ex ->
                        assertThat(((BusinessException) ex).getErrorCode()).isEqualTo(ErrorCode.BOXER_POTENTIAL_PROFILE_INCOMPLETE));
    }

    @Test
    void missingOrUnsupportedGenderBlocksMeasurement() {
        assertThatThrownBy(() -> resolver.resolve(profile(null, LocalDate.of(2000, 1, 1)), LocalDate.of(2026, 7, 1)))
                .isInstanceOfSatisfying(BusinessException.class, ex ->
                        assertThat(((BusinessException) ex).getErrorCode()).isEqualTo(ErrorCode.BOXER_POTENTIAL_GENDER_REQUIRED));

        assertThatThrownBy(() -> resolver.resolve(profile("OTHER", LocalDate.of(2000, 1, 1)), LocalDate.of(2026, 7, 1)))
                .isInstanceOfSatisfying(BusinessException.class, ex ->
                        assertThat(((BusinessException) ex).getErrorCode()).isEqualTo(ErrorCode.BOXER_POTENTIAL_UNSUPPORTED_GENDER));
    }

    private ProfileEntity profile(String gender, LocalDate birthDate) {
        ProfileEntity profile = new ProfileEntity();
        profile.setGender(gender);
        profile.setBirthDate(birthDate);
        return profile;
    }
}
