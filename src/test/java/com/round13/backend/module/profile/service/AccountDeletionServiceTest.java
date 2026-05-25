package com.round13.backend.module.profile.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatus;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.auth.service.RefreshTokenService;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountDeletionServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AccountDeletionService service;

    @Test
    void deleteMyAccountMarksUserDeletedAndRevokesRefreshTokens() {
        UUID userId = UUID.randomUUID();
        UserEntity user = new UserEntity();
        user.setId(userId);
        user.setStatus(UserStatus.ACTIVE);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        service.deleteMyAccount(userId);

        assertThat(user.getStatus()).isEqualTo(UserStatus.DELETED);
        assertThat(user.getDeletedAt()).isNotNull();
        verify(refreshTokenService).revokeAllByUserId(userId);
        verify(userRepository).save(user);
    }

    @Test
    void deleteMyAccountKeepsExistingDeletedAt() {
        UUID userId = UUID.randomUUID();
        OffsetDateTime deletedAt = OffsetDateTime.parse("2026-05-19T12:00:00Z");
        UserEntity user = new UserEntity();
        user.setId(userId);
        user.setStatus(UserStatus.DELETED);
        user.setDeletedAt(deletedAt);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        service.deleteMyAccount(userId);

        assertThat(user.getStatus()).isEqualTo(UserStatus.DELETED);
        assertThat(user.getDeletedAt()).isEqualTo(deletedAt);
        verify(refreshTokenService).revokeAllByUserId(userId);
        verify(userRepository).save(user);
    }

    @Test
    void deleteMyAccountRejectsMissingUser() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteMyAccount(userId))
                .isInstanceOfSatisfying(BusinessException.class, ex ->
                        assertThat(((BusinessException) ex).getErrorCode()).isEqualTo(ErrorCode.USER_NOT_FOUND));
    }
}
