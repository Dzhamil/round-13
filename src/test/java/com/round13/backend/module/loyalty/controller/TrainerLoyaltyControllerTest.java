package com.round13.backend.module.loyalty.controller;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.loyalty.service.LoyaltyAccrualService;
import com.round13.backend.module.loyalty.service.LoyaltyPermissionPolicy;
import com.round13.backend.module.loyalty.service.LoyaltyQueryService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TrainerLoyaltyControllerTest {

    private final LoyaltyAccrualService accrualService = mock(LoyaltyAccrualService.class);
    private final LoyaltyQueryService queryService = mock(LoyaltyQueryService.class);
    private final LoyaltyPermissionPolicy permissionPolicy = mock(LoyaltyPermissionPolicy.class);
    private final TrainerLoyaltyController controller = new TrainerLoyaltyController(
            accrualService,
            queryService,
            permissionPolicy
    );

    @Test
    void historyChecksTrainerStudentPermissionBeforeReadingHistory() {
        UUID coachId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        Authentication authentication = authentication(coachId);
        when(queryService.history(studentId, 25, null)).thenReturn(List.of());

        controller.history(authentication, studentId, 25);

        verify(permissionPolicy).requireCanViewTrainerStudentHistory(coachId, studentId);
        verify(queryService).history(studentId, 25, null);
    }

    @Test
    void historyDoesNotReadHistoryWhenTrainerStudentPermissionFails() {
        UUID coachId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        Authentication authentication = authentication(coachId);
        doThrow(new BusinessException(ErrorCode.LOYALTY_FORBIDDEN))
                .when(permissionPolicy)
                .requireCanViewTrainerStudentHistory(coachId, studentId);

        assertThatThrownBy(() -> controller.history(authentication, studentId, 25))
                .isInstanceOf(BusinessException.class);

        verify(queryService, never()).history(studentId, 25, null);
    }

    private static Authentication authentication(UUID userId) {
        return new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of());
    }
}
