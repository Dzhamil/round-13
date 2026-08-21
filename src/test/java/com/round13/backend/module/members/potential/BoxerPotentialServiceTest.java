package com.round13.backend.module.members.potential;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.members.potential.dto.BoxerPotentialMeasurementRequest;
import com.round13.backend.module.members.potential.dto.BoxerPotentialMeasurementResponse;
import com.round13.backend.module.user.dto.UserProfileBundle;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BoxerPotentialServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final BoxerPotentialMeasurementRepository measurementRepository = mock(BoxerPotentialMeasurementRepository.class);
    private final BoxerPotentialAccessPolicy accessPolicy = mock(BoxerPotentialAccessPolicy.class);

    private final BoxerPotentialService service = new BoxerPotentialService(
            userRepository,
            measurementRepository,
            accessPolicy,
            new BoxerPotentialNormResolver(),
            new BoxerPotentialCalculationService(),
            new BoxerPotentialMapper()
    );

    @Test
    void updateMeasurementRecalculatesScoresAndStoresUpdateAudit() {
        UUID actorId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        UUID measurementId = UUID.randomUUID();
        UserEntity actor = user(actorId, "coach");
        UserEntity member = user(memberId, "fighter");
        ProfileEntity profile = profile(member);
        BoxerPotentialMeasurementEntity existing = existingMeasurement(measurementId, member);
        OffsetDateTime measuredAt = OffsetDateTime.parse("2026-08-21T07:00:00Z");

        when(measurementRepository.findById(measurementId)).thenReturn(Optional.of(existing));
        when(userRepository.findUserProfileBundle(memberId)).thenReturn(Optional.of(new UserProfileBundle(member, profile, null)));
        when(userRepository.findByIdWithRole(actorId)).thenReturn(Optional.of(actor));
        when(measurementRepository.save(same(existing))).thenReturn(existing);

        BoxerPotentialMeasurementResponse response = service.updateMeasurement(
                actorId,
                memberId,
                measurementId,
                new BoxerPotentialMeasurementRequest(
                        measuredAt,
                        BigDecimal.valueOf(100),
                        BigDecimal.valueOf(40),
                        BigDecimal.valueOf(80),
                        BigDecimal.valueOf(999),
                        BigDecimal.valueOf(100),
                        BigDecimal.valueOf(80),
                        BigDecimal.valueOf(220),
                        BigDecimal.valueOf(110)
                )
        );

        assertThat(response.id()).isEqualTo(measurementId);
        assertThat(response.measuredAt()).isEqualTo(measuredAt);
        assertThat(response.updatedByUserId()).isEqualTo(actorId);
        assertThat(response.raw().punchForceKg()).isEqualByComparingTo("999");
        assertThat(response.testScores().punchForceScore()).isEqualByComparingTo("100.00");
        assertThat(response.potentialScore()).isEqualByComparingTo("100.00");
        verify(measurementRepository).save(same(existing));
    }

    private UserEntity user(UUID id, String nickname) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setNickname(nickname);
        return user;
    }

    private ProfileEntity profile(UserEntity member) {
        ProfileEntity profile = new ProfileEntity();
        profile.setUser(member);
        profile.setBirthDate(LocalDate.of(2000, 1, 1));
        profile.setGender("MALE");
        return profile;
    }

    private BoxerPotentialMeasurementEntity existingMeasurement(UUID measurementId, UserEntity member) {
        BoxerPotentialMeasurementEntity entity = new BoxerPotentialMeasurementEntity();
        entity.setId(measurementId);
        entity.setMember(member);
        entity.setCreatedByUser(user(UUID.randomUUID(), "creator"));
        entity.setMeasuredAt(OffsetDateTime.parse("2026-08-20T07:00:00Z"));
        entity.setNormGroup(BoxerPotentialNormGroup.MALE_16_PLUS);
        entity.setNormSet(BoxerPotentialNormSet.MALE);
        entity.setAgeAtMeasurement(26);
        entity.setGenderAtMeasurement("MALE");
        entity.setPushUps90Sec(BigDecimal.ZERO);
        entity.setPullUps(BigDecimal.ZERO);
        entity.setJumpSquats90Sec(BigDecimal.ZERO);
        entity.setPunchForceKg(BigDecimal.ZERO);
        entity.setBurpees5Min(BigDecimal.ZERO);
        entity.setPunches20Sec(BigDecimal.ZERO);
        entity.setRopeJumps60Sec(BigDecimal.ZERO);
        entity.setDoubleUnders60Sec(BigDecimal.ZERO);
        entity.setPushUpsScore(BigDecimal.ZERO);
        entity.setPullUpsScore(BigDecimal.ZERO);
        entity.setJumpSquatsScore(BigDecimal.ZERO);
        entity.setPunchForceScore(BigDecimal.ZERO);
        entity.setBurpeesScore(BigDecimal.ZERO);
        entity.setPunchesScore(BigDecimal.ZERO);
        entity.setRopeJumpsScore(BigDecimal.ZERO);
        entity.setDoubleUndersScore(BigDecimal.ZERO);
        entity.setStrengthScore(BigDecimal.ZERO);
        entity.setEnduranceScore(BigDecimal.ZERO);
        entity.setSpeedScore(BigDecimal.ZERO);
        entity.setAgilityScore(BigDecimal.ZERO);
        entity.setPotentialScore(BigDecimal.ZERO);
        return entity;
    }
}
