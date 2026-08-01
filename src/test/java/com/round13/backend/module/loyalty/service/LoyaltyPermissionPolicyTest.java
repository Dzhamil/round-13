package com.round13.backend.module.loyalty.service;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.module.loyalty.domain.LoyaltyPointSourceType;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.user.UserRoleCodes;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LoyaltyPermissionPolicyTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final UserTrainerLinkRepository linkRepository = mock(UserTrainerLinkRepository.class);
    private final LoyaltyPermissionPolicy policy = new LoyaltyPermissionPolicy(userRepository, linkRepository);

    @Test
    void coachCanAwardAllowedOperationalSourcesButCannotCorrect() {
        UUID coachId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        when(userRepository.findRoleCode(coachId)).thenReturn(Optional.of(UserRoleCodes.COACH));
        when(linkRepository.existsByTrainerIdAndStudentId(coachId, studentId)).thenReturn(true);

        assertThatCode(() -> policy.requireCanAward(coachId, studentId, LoyaltyPointSourceType.BOXING_MATCH))
                .doesNotThrowAnyException();
        assertThatThrownBy(() -> policy.requireCanAward(coachId, studentId, LoyaltyPointSourceType.RECRUITMENT))
                .isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> policy.requireCanAward(coachId, UUID.randomUUID(), LoyaltyPointSourceType.BOXING_MATCH))
                .isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> policy.requireCanCorrectOrRevoke(coachId))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void adminCanAwardCorrectAndRevoke() {
        UUID adminId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        when(userRepository.findRoleCode(adminId)).thenReturn(Optional.of(UserRoleCodes.ADMIN));

        assertThatCode(() -> policy.requireCanAward(adminId, memberId, LoyaltyPointSourceType.RECRUITMENT))
                .doesNotThrowAnyException();
        assertThatCode(() -> policy.requireCanCorrectOrRevoke(adminId))
                .doesNotThrowAnyException();
    }
}
