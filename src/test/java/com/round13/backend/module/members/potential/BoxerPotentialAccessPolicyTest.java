package com.round13.backend.module.members.potential;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.user.UserRoleCodes;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BoxerPotentialAccessPolicyTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final UserTrainerLinkRepository linkRepository = mock(UserTrainerLinkRepository.class);
    private final BoxerPotentialAccessPolicy policy = new BoxerPotentialAccessPolicy(userRepository, linkRepository);

    @Test
    void athleteCanReadOwnResultsButCannotCreate() {
        UUID athleteId = UUID.randomUUID();
        when(userRepository.findRoleCode(athleteId)).thenReturn(Optional.of(UserRoleCodes.ATHLETE));

        assertThat(policy.canRead(athleteId, athleteId)).isTrue();
        assertThat(policy.canCreate(athleteId, athleteId)).isFalse();
    }

    @Test
    void coachCanCreateOnlyForOwnStudent() {
        UUID coachId = UUID.randomUUID();
        UUID ownStudentId = UUID.randomUUID();
        UUID otherStudentId = UUID.randomUUID();
        when(userRepository.findRoleCode(coachId)).thenReturn(Optional.of(UserRoleCodes.COACH));
        when(userRepository.findRoleCode(ownStudentId)).thenReturn(Optional.of(UserRoleCodes.ATHLETE));
        when(userRepository.findRoleCode(otherStudentId)).thenReturn(Optional.of(UserRoleCodes.ATHLETE));
        when(linkRepository.existsByTrainerIdAndStudentId(coachId, ownStudentId)).thenReturn(true);

        assertThat(policy.canCreate(coachId, ownStudentId)).isTrue();
        assertThat(policy.canCreate(coachId, otherStudentId)).isFalse();
    }

    @Test
    void coachCannotCreateOwnMeasurementEvenIfSelfLinkExists() {
        UUID coachId = UUID.randomUUID();
        when(userRepository.findRoleCode(coachId)).thenReturn(Optional.of(UserRoleCodes.COACH));
        when(linkRepository.existsByTrainerIdAndStudentId(coachId, coachId)).thenReturn(true);

        assertThat(policy.canCreate(coachId, coachId)).isFalse();
    }

    @Test
    void adminCanCreateForFighterButNotForCoachTarget() {
        UUID adminId = UUID.randomUUID();
        UUID fighterId = UUID.randomUUID();
        UUID coachTargetId = UUID.randomUUID();
        when(userRepository.findRoleCode(adminId)).thenReturn(Optional.of(UserRoleCodes.ADMIN));
        when(userRepository.findRoleCode(fighterId)).thenReturn(Optional.of(UserRoleCodes.ATHLETE));
        when(userRepository.findRoleCode(coachTargetId)).thenReturn(Optional.of(UserRoleCodes.COACH));

        assertThat(policy.canCreate(adminId, fighterId)).isTrue();
        assertThat(policy.canCreate(adminId, coachTargetId)).isFalse();
    }

    @Test
    void coachCanReadOwnPotentialSummaryAsReadOnlySelfProfile() {
        UUID coachId = UUID.randomUUID();
        when(userRepository.findRoleCode(coachId)).thenReturn(Optional.of(UserRoleCodes.COACH));

        assertThat(policy.canRead(coachId, coachId)).isTrue();
        assertThat(policy.canCreate(coachId, coachId)).isFalse();
    }

    @Test
    void requireCreateRejectsAthleteAndCoachSelfWrites() {
        UUID athleteId = UUID.randomUUID();
        UUID coachId = UUID.randomUUID();
        when(userRepository.findRoleCode(athleteId)).thenReturn(Optional.of(UserRoleCodes.ATHLETE));
        when(userRepository.findRoleCode(coachId)).thenReturn(Optional.of(UserRoleCodes.COACH));

        assertThatThrownBy(() -> policy.requireCreate(athleteId, athleteId))
                .isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> policy.requireCreate(coachId, coachId))
                .isInstanceOf(BusinessException.class);
    }
}
