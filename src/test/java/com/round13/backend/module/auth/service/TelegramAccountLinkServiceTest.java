package com.round13.backend.module.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.round13.backend.domain.RoleEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatus;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.auth.dto.AuthTokensResponse;
import com.round13.backend.module.auth.dto.TelegramAccountLinkRequest;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.module.user.service.UserService;
import com.round13.backend.security.JwtService;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TelegramAccountLinkServiceTest {

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
    void linksWebFirstAccountAndIssuesTokensForSameUserId() {
        UserEntity user = user(null);
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID)).thenReturn(Optional.empty());
        when(userRepository.findByPhoneWithRoleForUpdate(PHONE)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(PASSWORD, user.getPasswordHash())).thenReturn(true);

        AuthTokensResponse response = authService.linkTelegramAccount(request("8 (939) 393-09-20", PASSWORD));

        assertThat(user.getTelegramUserId()).isEqualTo(TELEGRAM_ID);
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        verify(jwtService).generateAccessToken(user.getId().toString(), List.of("ROLE_ATHLETE"));
        verify(refreshTokenService).create(eq(user), any(), any(OffsetDateTime.class));
    }

    @Test
    void wrongPasswordDoesNotLinkTelegramId() {
        UserEntity user = user(null);
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID)).thenReturn(Optional.empty());
        when(userRepository.findByPhoneWithRoleForUpdate(PHONE)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", user.getPasswordHash())).thenReturn(false);

        assertError(request(PHONE, "wrong-password"), ErrorCode.INVALID_CREDENTIALS);

        assertThat(user.getTelegramUserId()).isNull();
        verify(jwtService, never()).generateAccessToken(any(), any());
    }

    @Test
    void accountLinkedToAnotherTelegramIdIsBlocked() {
        UserEntity user = user(111L);
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID)).thenReturn(Optional.empty());
        when(userRepository.findByPhoneWithRoleForUpdate(PHONE)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(PASSWORD, user.getPasswordHash())).thenReturn(true);

        assertError(request(PHONE, PASSWORD), ErrorCode.TELEGRAM_ACCOUNT_ALREADY_LINKED);

        assertThat(user.getTelegramUserId()).isEqualTo(111L);
        verify(jwtService, never()).generateAccessToken(any(), any());
    }

    @Test
    void unknownPhoneDoesNotCreateUser() {
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID)).thenReturn(Optional.empty());
        when(userRepository.findByPhoneWithRoleForUpdate(PHONE)).thenReturn(Optional.empty());

        assertError(request(PHONE, PASSWORD), ErrorCode.INVALID_CREDENTIALS);

        verify(userRepository, never()).save(any());
        verify(userService, never()).findOrCreateByTelegramUserId(any());
    }

    @Test
    void knownTelegramIdContinuesOrdinaryLoginWithoutRelinking() {
        UserEntity existingTelegramUser = user(TELEGRAM_ID);
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID))
                .thenReturn(Optional.of(existingTelegramUser));

        AuthTokensResponse response = authService.linkTelegramAccount(request("invalid", "invalid"));

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        verify(userRepository, never()).findByPhoneWithRoleForUpdate(any());
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void knownTelegramIdentityReactivatesExistingAccountWithoutCreatingDuplicate() {
        UserEntity deletedUser = user(TELEGRAM_ID);
        deletedUser.markDeleted(OffsetDateTime.parse("2026-09-05T12:00:00Z"));
        UUID existingUserId = deletedUser.getId();
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID))
                .thenReturn(Optional.of(deletedUser));

        AuthTokensResponse response = authService.linkTelegramAccount(request("invalid", "invalid"));

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(deletedUser.getId()).isEqualTo(existingUserId);
        assertThat(deletedUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(deletedUser.getDeletedAt()).isNull();
        verify(userRepository, never()).save(any());
        verify(userService, never()).findOrCreateByTelegramUserId(any());
    }

    @Test
    void verifiedPhonePasswordReactivatesAccountForSameTelegramIdentity() {
        UserEntity deletedUser = user(null);
        deletedUser.markDeleted(OffsetDateTime.parse("2026-09-05T12:00:00Z"));
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID)).thenReturn(Optional.empty());
        when(userRepository.findByPhoneWithRoleForUpdate(PHONE)).thenReturn(Optional.of(deletedUser));
        when(passwordEncoder.matches(PASSWORD, deletedUser.getPasswordHash())).thenReturn(true);

        authService.linkTelegramAccount(request(PHONE, PASSWORD));

        assertThat(deletedUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(deletedUser.getDeletedAt()).isNull();
        assertThat(deletedUser.getTelegramUserId()).isEqualTo(TELEGRAM_ID);
        verify(userRepository, never()).save(any());
    }

    @Test
    void deletedPhoneAccountLinkedToAnotherTelegramIdentityRemainsRejected() {
        UserEntity deletedUser = user(111L);
        deletedUser.markDeleted(OffsetDateTime.parse("2026-09-05T12:00:00Z"));
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID)).thenReturn(Optional.empty());
        when(userRepository.findByPhoneWithRoleForUpdate(PHONE)).thenReturn(Optional.of(deletedUser));
        when(passwordEncoder.matches(PASSWORD, deletedUser.getPasswordHash())).thenReturn(true);

        assertError(request(PHONE, PASSWORD), ErrorCode.TELEGRAM_ACCOUNT_ALREADY_LINKED);

        assertThat(deletedUser.getStatus()).isEqualTo(UserStatus.DELETED);
        assertThat(deletedUser.getDeletedAt()).isNotNull();
        verify(jwtService, never()).generateAccessToken(any(), any());
    }

    private void assertError(TelegramAccountLinkRequest request, ErrorCode expected) {
        assertThatThrownBy(() -> authService.linkTelegramAccount(request))
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(expected));
    }

    private TelegramAccountLinkRequest request(String phone, String password) {
        return new TelegramAccountLinkRequest(
                "user=%7B%22id%22%3A" + TELEGRAM_ID + "%7D",
                phone,
                password
        );
    }

    private UserEntity user(Long telegramUserId) {
        RoleEntity role = new RoleEntity();
        role.setCode("ATHLETE");
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setPhone(PHONE);
        user.setPasswordHash("encoded-password");
        user.setTelegramUserId(telegramUserId);
        user.setStatus(UserStatus.ACTIVE);
        user.setRole(role);
        return user;
    }
}
