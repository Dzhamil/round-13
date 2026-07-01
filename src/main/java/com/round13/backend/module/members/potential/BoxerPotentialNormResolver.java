package com.round13.backend.module.members.potential;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.Locale;

@Service
public class BoxerPotentialNormResolver {

    private static final int CHILD_AGE_LIMIT = 16;
    private static final BigDecimal MALE_FORCE_NORM = BigDecimal.valueOf(400);
    private static final BigDecimal FEMALE_CHILD_FORCE_NORM = BigDecimal.valueOf(150);
    private static final String GENDER_MALE = "MALE";
    private static final String GENDER_FEMALE = "FEMALE";

    public BoxerPotentialNormProfile resolve(ProfileEntity profile, LocalDate measurementDate) {
        if (profile == null || profile.getBirthDate() == null) {
            throw new BusinessException(ErrorCode.BOXER_POTENTIAL_PROFILE_INCOMPLETE);
        }
        if (profile.getGender() == null || profile.getGender().isBlank()) {
            throw new BusinessException(ErrorCode.BOXER_POTENTIAL_GENDER_REQUIRED);
        }
        if (measurementDate == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        int age = Period.between(profile.getBirthDate(), measurementDate).getYears();
        if (age < 0) {
            throw new BusinessException(ErrorCode.BOXER_POTENTIAL_PROFILE_INCOMPLETE);
        }

        String gender = profile.getGender().trim().toUpperCase(Locale.ROOT);
        if (!GENDER_MALE.equals(gender) && !GENDER_FEMALE.equals(gender)) {
            throw new BusinessException(ErrorCode.BOXER_POTENTIAL_UNSUPPORTED_GENDER);
        }

        if (age < CHILD_AGE_LIMIT) {
            return new BoxerPotentialNormProfile(
                    BoxerPotentialNormGroup.CHILD,
                    BoxerPotentialNormSet.FEMALE_CHILD,
                    age,
                    gender,
                    FEMALE_CHILD_FORCE_NORM
            );
        }

        if (GENDER_MALE.equals(gender)) {
            return new BoxerPotentialNormProfile(
                    BoxerPotentialNormGroup.MALE_16_PLUS,
                    BoxerPotentialNormSet.MALE,
                    age,
                    gender,
                    MALE_FORCE_NORM
            );
        }

        return new BoxerPotentialNormProfile(
                BoxerPotentialNormGroup.FEMALE,
                BoxerPotentialNormSet.FEMALE_CHILD,
                age,
                gender,
                FEMALE_CHILD_FORCE_NORM
        );
    }
}
