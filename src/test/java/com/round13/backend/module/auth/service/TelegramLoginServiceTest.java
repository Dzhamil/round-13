package com.round13.backend.module.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.round13.backend.domain.*;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.auth.dto.AuthTokensResponse;
import com.round13.backend.module.auth.dto.PhonePasswordLoginRequest;
import com.round13.backend.module.auth.dto.TelegramInitDataRequest;
import com.round13.backend.module.members.repo.UserStatsCacheRepository;
import com.round13.backend.module.members.service.MemberPointsCacheService;
import com.round13.backend.module.members.service.UserStatsFactory;
import com.round13.backend.module.profile.mapper.ProfileMapper;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.mapper.TelegramUserMapper;
import com.round13.backend.module.user.mapper.UserProfileResponseMapper;
import com.round13.backend.module.user.repo.RoleRepository;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.module.user.service.UserService;
import com.round13.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mapstruct.factory.Mappers;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Exercises the real Telegram user resolution and mapping through the token-issuing service. */
class TelegramLoginServiceTest {
    private static final long TELEGRAM_ID = 123456789L;
    private final UserRepository users = mock(UserRepository.class);
    private final RoleRepository roles = mock(RoleRepository.class);
    private final ProfileRepository profiles = mock(ProfileRepository.class);
    private final UserStatsCacheRepository stats = mock(UserStatsCacheRepository.class);
    private final JwtService jwt = mock(JwtService.class);
    private final RefreshTokenService refreshTokens = mock(RefreshTokenService.class);
    private final PasswordEncoder passwords = spy(new BCryptPasswordEncoder());
    private final ObjectMapper json = new ObjectMapper();
    private final UserService userService = new UserService(users, roles, profiles, stats,
            Mappers.getMapper(TelegramUserMapper.class), Mappers.getMapper(ProfileMapper.class),
            mock(UserProfileResponseMapper.class), new UserStatsFactory(), mock(MemberPointsCacheService.class));
    private final AuthService auth = new AuthService(users, jwt, refreshTokens, userService, json, passwords);
    private final RoleEntity role = new RoleEntity();

    @BeforeEach
    void setUp() {
        role.setCode("ATHLETE");
        when(roles.findByCode("ATHLETE")).thenReturn(Optional.of(role));
        when(users.save(any())).thenAnswer(invocation -> {
            UserEntity user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });
        when(jwt.generateAccessToken(anyString(), anyList())).thenReturn("access-token");
        when(refreshTokens.create(any(), anyString(), any())).thenReturn("refresh-token");
    }

    @Test
    void unknownTelegramUserCreatesProfileAndStatsAndIssuesTokensWithoutWebCredentials() throws Exception {
        AuthTokensResponse tokens = auth.loginByTelegram(request(" @New_User "));

        var saved = org.mockito.ArgumentCaptor.forClass(UserEntity.class);
        verify(users).save(saved.capture());
        UserEntity user = saved.getValue();
        assertThat(user.getTelegramUserId()).isEqualTo(TELEGRAM_ID);
        assertThat(user.getNickname()).isEqualTo("new_user");
        assertThat(user.getStatus()).isEqualTo(UserStatus.PROFILE_INCOMPLETE);
        assertThat(user.getPhone()).isNull();
        assertThat(user.getPasswordHash()).isNull();
        assertThat(user.isPhoneVerifiedByStaff()).isFalse();
        verify(profiles).save(argThat(profile -> profile.getUser() == user));
        verify(stats).save(argThat(value -> value.getUser() == user && value.getUserId().equals(user.getId())));
        verifyNoInteractions(passwords);
        assertTokens(tokens, user);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void telegramUserWithoutUsernameCanRegister(String username) throws Exception {
        AuthTokensResponse tokens = auth.loginByTelegram(request(username));
        verify(users).save(argThat(user -> user.getNickname() == null));
        verify(users, never()).findByNormalizedNicknameForUpdate(anyString());
        assertThat(tokens.getAccessToken()).isEqualTo("access-token");
    }

    @Test
    void existingTelegramIdUsesSameIdentityDespiteChangedNicknameAndMissingWebCredentials() throws Exception {
        UserEntity user = user(TELEGRAM_ID, UserStatus.ACTIVE);
        when(users.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID)).thenReturn(Optional.of(user));

        assertTokens(auth.loginByTelegram(request("changed_username")), user);

        verify(users, never()).findByNormalizedNicknameForUpdate(anyString());
        verify(users, never()).save(any());
        verifyNoInteractions(passwords, profiles, stats);
    }

    @Test
    void normalizedNicknameAttachesUnclaimedPlaceholderAndPreservesItsData() throws Exception {
        UserEntity user = user(null, UserStatus.ACTIVE);
        user.setPhone("+79393930920");
        user.setPasswordHash("existing-admin-generated-password");
        user.setNickname(" @MiXeD_User ");
        when(users.findByNormalizedNicknameForUpdate("mixed_user")).thenReturn(List.of(user));

        assertTokens(auth.loginByTelegram(request("Mixed_User")), user);

        assertThat(user.getTelegramUserId()).isEqualTo(TELEGRAM_ID);
        assertThat(user.getNickname()).isEqualTo(" @MiXeD_User ");
        assertThat(user.getPhone()).isEqualTo("+79393930920");
        assertThat(user.getPasswordHash()).isEqualTo("existing-admin-generated-password");
        assertThat(user.isPhoneVerifiedByStaff()).isFalse();
        verify(users, never()).save(any());
        verifyNoInteractions(passwords, profiles, stats);
    }

    @Test
    void nicknameLinkedToAnotherTelegramIdIsNeverStolen() throws Exception {
        UserEntity user = user(111L, UserStatus.ACTIVE);
        when(users.findByNormalizedNicknameForUpdate("nickname")).thenReturn(List.of(user));
        assertRejected(ErrorCode.TELEGRAM_NICKNAME_CONFLICT);
        assertThat(user.getTelegramUserId()).isEqualTo(111L);
    }

    @Test
    void concurrentAttachOfSameTelegramIdentityIsIdempotent() throws Exception {
        UserEntity user = user(TELEGRAM_ID, UserStatus.ACTIVE);
        when(users.findByNormalizedNicknameForUpdate("nickname")).thenReturn(List.of(user));
        assertTokens(auth.loginByTelegram(request("nickname")), user);
        verify(users, never()).save(any());
    }

    @Test
    void deletedPlaceholderIsNotClaimedOrReactivated() throws Exception {
        UserEntity user = user(null, UserStatus.ACTIVE);
        user.markDeleted(OffsetDateTime.now());
        when(users.findByNormalizedNicknameForUpdate("nickname")).thenReturn(List.of(user));
        assertRejected(ErrorCode.USER_DELETED);
        assertThat(user.getTelegramUserId()).isNull();
        assertThat(user.isDeleted()).isTrue();
    }

    @Test
    void blockedPlaceholderIsNotClaimed() throws Exception {
        UserEntity user = user(null, UserStatus.BLOCKED);
        when(users.findByNormalizedNicknameForUpdate("nickname")).thenReturn(List.of(user));
        assertRejected(ErrorCode.USER_BLOCKED);
        assertThat(user.getTelegramUserId()).isNull();
    }

    @Test
    void ambiguousNormalizedNicknameDoesNotChooseAnArbitraryAccount() throws Exception {
        UserEntity first = user(null, UserStatus.ACTIVE);
        UserEntity second = user(null, UserStatus.ACTIVE);
        when(users.findByNormalizedNicknameForUpdate("nickname")).thenReturn(List.of(first, second));
        assertRejected(ErrorCode.TELEGRAM_NICKNAME_CONFLICT);
        assertThat(first.getTelegramUserId()).isNull();
        assertThat(second.getTelegramUserId()).isNull();
    }

    @Test
    void existingBlockedTelegramUserDoesNotReceiveTokens() throws Exception {
        when(users.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID))
                .thenReturn(Optional.of(user(TELEGRAM_ID, UserStatus.BLOCKED)));
        assertRejected(ErrorCode.USER_BLOCKED);
    }

    @Test
    void webPhonePasswordLoginStillIssuesTokensWithUserIdSubject() {
        UserEntity user = user(null, UserStatus.ACTIVE);
        user.setPhone("+79393930920");
        user.setPasswordHash(passwords.encode("web-password"));
        when(users.findByPhoneWithRole(user.getPhone())).thenReturn(Optional.of(user));

        assertTokens(auth.loginByPhoneAndPassword(new PhonePasswordLoginRequest("8 (939) 393-09-20", "web-password")), user);
        verify(users, never()).findTopByTelegramUserIdOrderByCreatedAtDesc(anyLong());
        verify(users, never()).findByNormalizedNicknameForUpdate(anyString());
        assertThatThrownBy(() -> auth.loginByPhoneAndPassword(new PhonePasswordLoginRequest(user.getPhone(), "wrong")))
                .isInstanceOfSatisfying(BusinessException.class,
                        error -> assertThat(error.getErrorCode()).isEqualTo(ErrorCode.INVALID_CREDENTIALS));
    }

    private void assertRejected(ErrorCode code) throws Exception {
        TelegramInitDataRequest request = request("nickname");
        assertThatThrownBy(() -> auth.loginByTelegram(request))
                .isInstanceOfSatisfying(BusinessException.class, error -> assertThat(error.getErrorCode()).isEqualTo(code));
        verifyNoInteractions(jwt, refreshTokens, passwords);
        verify(users, never()).save(any());
    }

    private void assertTokens(AuthTokensResponse tokens, UserEntity user) {
        assertThat(tokens.getAccessToken()).isEqualTo("access-token");
        assertThat(tokens.getRefreshToken()).isEqualTo("refresh-token");
        verify(jwt).generateAccessToken(user.getId().toString(), List.of("ROLE_ATHLETE"));
        verify(refreshTokens).create(eq(user), anyString(), any());
    }

    private TelegramInitDataRequest request(String username) throws Exception {
        var telegram = json.createObjectNode().put("id", TELEGRAM_ID).put("username", username);
        return new TelegramInitDataRequest("user=" + URLEncoder.encode(json.writeValueAsString(telegram), StandardCharsets.UTF_8).replace("+", "%20"));
    }

    private UserEntity user(Long telegramId, UserStatus status) {
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setTelegramUserId(telegramId);
        user.setRole(role);
        user.setStatus(status);
        return user;
    }
}
