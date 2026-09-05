package com.round13.backend.module.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.round13.backend.domain.RoleEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatus;
import com.round13.backend.module.auth.dto.PhonePasswordLoginRequest;
import com.round13.backend.module.auth.dto.TelegramInitDataRequest;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.module.user.service.UserService;
import com.round13.backend.security.JwtService;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceReactivationTest {

    private static final long TELEGRAM_ID = 987654321L;
    private static final String PHONE = "+79393930920";
    private static final String PASSWORD = "strong-password";

    private final UserRepository userRepository = mock(UserRepository.class);
    private final JwtService jwtService = mock(JwtService.class);
    private final RefreshTokenService refreshTokenService = mock(RefreshTokenService.class);
    private final UserService userService = mock(UserService.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final AuthService authService = new AuthService(
            userRepository,
            jwtService,
            refreshTokenService,
            userService,
            new ObjectMapper(),
            passwordEncoder,
            new RussianPhoneNormalizer()
    );

    @BeforeEach
    void setUpTokenResponses() {
        when(jwtService.generateAccessToken(any(), any())).thenReturn("access-token");
        when(refreshTokenService.create(any(), any(), any(OffsetDateTime.class))).thenReturn("refresh-token");
    }

    @Test
    void telegramLoginReactivatesExistingAccountAndPreservesId() {
        UserEntity deletedUser = deletedUser(TELEGRAM_ID);
        UUID existingUserId = deletedUser.getId();
        when(userService.findOrCreateByTelegramUserId(any())).thenReturn(deletedUser);

        authService.loginByTelegram(new TelegramInitDataRequest(
                "user=%7B%22id%22%3A" + TELEGRAM_ID + "%7D"
        ));

        assertThat(deletedUser.getId()).isEqualTo(existingUserId);
        assertThat(deletedUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(deletedUser.getDeletedAt()).isNull();
        verify(userRepository, never()).save(any());
    }

    @Test
    void phonePasswordLoginReactivatesExistingAccountWithoutCreatingDuplicate() {
        UserEntity deletedUser = deletedUser(null);
        UUID existingUserId = deletedUser.getId();
        when(userRepository.findByPhoneWithRole(PHONE)).thenReturn(Optional.of(deletedUser));
        when(passwordEncoder.matches(PASSWORD, deletedUser.getPasswordHash())).thenReturn(true);

        authService.loginByPhoneAndPassword(new PhonePasswordLoginRequest(PHONE, PASSWORD));

        assertThat(deletedUser.getId()).isEqualTo(existingUserId);
        assertThat(deletedUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(deletedUser.getDeletedAt()).isNull();
        verify(userRepository, never()).save(any());
        verify(userService, never()).findOrCreateByTelegramUserId(any());
    }

    private UserEntity deletedUser(Long telegramUserId) {
        RoleEntity role = new RoleEntity();
        role.setCode("ATHLETE");
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setPhone(PHONE);
        user.setPasswordHash("encoded-password");
        user.setTelegramUserId(telegramUserId);
        user.setStatus(UserStatus.ACTIVE);
        user.setRole(role);
        user.markDeleted(OffsetDateTime.parse("2026-09-05T12:00:00Z"));
        return user;
    }
}
