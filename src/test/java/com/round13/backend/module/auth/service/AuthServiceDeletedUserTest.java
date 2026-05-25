package com.round13.backend.module.auth.service;

import com.round13.backend.domain.RefreshTokenEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatus;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.module.user.service.UserService;
import com.round13.backend.security.JwtService;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceDeletedUserTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final JwtService jwtService = mock(JwtService.class);
    private final RefreshTokenService refreshTokenService = mock(RefreshTokenService.class);
    private final UserService userService = mock(UserService.class);
    private final AuthService authService = new AuthService(
            userRepository,
            jwtService,
            refreshTokenService,
            userService,
            null,
            null
    );

    @Test
    void refreshRejectsDeletedUserBeforeTokenRotation() {
        String rawRefreshToken = "refresh-token";
        UUID userId = UUID.randomUUID();
        UserEntity tokenUser = user(userId, UserStatus.ACTIVE);
        UserEntity deletedUser = user(userId, UserStatus.DELETED);
        RefreshTokenEntity refreshToken = new RefreshTokenEntity();
        refreshToken.setUser(tokenUser);
        refreshToken.setExpiresAt(OffsetDateTime.now().plusDays(1));
        refreshToken.setRevoked(false);

        when(refreshTokenService.findByHash(rawRefreshToken)).thenReturn(refreshToken);
        when(userRepository.findByIdWithRole(userId)).thenReturn(Optional.of(deletedUser));

        assertThatThrownBy(() -> authService.refresh(rawRefreshToken))
                .isInstanceOfSatisfying(BusinessException.class, ex ->
                        assertThat(((BusinessException) ex).getErrorCode()).isEqualTo(ErrorCode.USER_DELETED));

        verify(refreshTokenService, never()).revoke(rawRefreshToken);
    }

    private UserEntity user(UUID id, UserStatus status) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setStatus(status);
        return user;
    }
}
