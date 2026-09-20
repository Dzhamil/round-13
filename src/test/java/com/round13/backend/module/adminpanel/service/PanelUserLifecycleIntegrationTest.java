package com.round13.backend.module.adminpanel.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.adminpanel.repo.DeletedUserDataRepository;
import com.round13.backend.module.auth.dto.TelegramUserDto;
import com.round13.backend.module.auth.service.RefreshTokenService;
import com.round13.backend.module.members.repo.UserStatsCacheRepository;
import com.round13.backend.module.members.service.*;
import com.round13.backend.module.profile.mapper.ProfileMapper;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.mapper.*;
import com.round13.backend.module.user.repo.*;
import com.round13.backend.module.user.service.UserService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.UUID;
import java.time.OffsetDateTime;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.round13.backend.exception.*;
import com.round13.backend.module.auth.dto.PhonePasswordLoginRequest;
import com.round13.backend.module.auth.service.AuthService;
import com.round13.backend.module.auth.service.TokenHashService;
import com.round13.backend.module.auth.mapper.RefreshTokenMapper;
import com.round13.backend.module.auth.repo.RefreshTokenRepository;
import com.round13.backend.module.adminpanel.controller.dto.PanelCreateUserRequest;
import com.round13.backend.security.JwtService;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@DataJpaTest(properties = {"spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop"})
class PanelUserLifecycleIntegrationTest {
    @Autowired UserRepository users;
    @Autowired RoleRepository roles;
    @Autowired ProfileRepository profiles;
    @Autowired UserStatsCacheRepository stats;
    @Autowired EntityManager em;
    @Autowired JdbcTemplate jdbc;
    @Autowired RefreshTokenRepository refreshTokens;

    @Test
    void webAccountCanBeBlockedUnblockedDeletedAndCreatedAgain() {
        jdbc.execute("create table if not exists phone_verification (phone varchar(32))");
        RoleEntity role = new RoleEntity();
        role.setCode("ATHLETE");
        roles.saveAndFlush(role);
        var passwords = new BCryptPasswordEncoder();
        var normalizer = new RussianPhoneNormalizer();
        var manual = new PanelManualUserService(users, roles, profiles, passwords, normalizer, new TemporaryPasswordGenerator());
        var request = new PanelCreateUserRequest("Test", "First", "Patronymic", "+79991234567", "web_user",
                "test-password", false, "ATHLETE");
        UUID oldId = manual.create(request).userId();
        users.flush();
        var tokenService = new RefreshTokenService(refreshTokens, Mappers.getMapper(RefreshTokenMapper.class),
                new TokenHashService("SHA-256"));
        var jwt = mock(JwtService.class);
        when(jwt.generateAccessToken(anyString(), anyList())).thenReturn("access");
        var auth = new AuthService(users, jwt, tokenService, mock(UserService.class), new ObjectMapper(), passwords, normalizer);
        var lifecycle = new PanelUserLifecycleService(users, roles, tokenService,
                new DeletedUserDataRepository(new NamedParameterJdbcTemplate(jdbc)));
        var login = new PhonePasswordLoginRequest(request.phone(), request.password());
        tokenService.create(users.findById(oldId).orElseThrow(), "old-refresh", OffsetDateTime.now().plusDays(1));
        users.flush();
        lifecycle.block(UUID.randomUUID(), oldId);
        em.clear();
        assertThatThrownBy(() -> auth.loginByPhoneAndPassword(login)).isInstanceOfSatisfying(BusinessException.class,
                error -> assertThat(error.getErrorCode()).isEqualTo(ErrorCode.USER_BLOCKED));
        assertThatThrownBy(() -> auth.refresh("old-refresh")).isInstanceOfSatisfying(BusinessException.class,
                error -> assertThat(error.getErrorCode()).isEqualTo(ErrorCode.USER_BLOCKED));
        lifecycle.unblock(UUID.randomUUID(), oldId);
        assertThat(auth.loginByPhoneAndPassword(login).getAccessToken()).isEqualTo("access");
        assertThatThrownBy(() -> auth.refresh("old-refresh")).isInstanceOfSatisfying(BusinessException.class,
                error -> assertThat(error.getErrorCode()).isEqualTo(ErrorCode.REFRESH_TOKEN_REVOKED));
        lifecycle.delete(UUID.randomUUID(), oldId);
        em.clear();
        assertThatThrownBy(() -> auth.loginByPhoneAndPassword(login)).isInstanceOfSatisfying(BusinessException.class,
                error -> assertThat(error.getErrorCode()).isEqualTo(ErrorCode.INVALID_CREDENTIALS));
        assertThatThrownBy(() -> auth.refresh("old-refresh")).isInstanceOfSatisfying(BusinessException.class,
                error -> assertThat(error.getErrorCode()).isEqualTo(ErrorCode.REFRESH_TOKEN_NOT_FOUND));
        UUID newId = manual.create(request).userId();
        users.flush();
        assertThat(newId).isNotEqualTo(oldId);
        assertThat(auth.loginByPhoneAndPassword(login).getAccessToken()).isEqualTo("access");
    }

    @Test
    void deletionClearsPersistedIdentityAndTelegramRegistrationCreatesNewProfile() {
        // This legacy table has no JPA entity, but is still cleared on deletion.
        jdbc.execute("create table if not exists phone_verification (phone varchar(32))");
        RoleEntity role = new RoleEntity();
        role.setCode("ATHLETE");
        roles.saveAndFlush(role);
        UserService registration = new UserService(users, roles, profiles, stats,
                Mappers.getMapper(TelegramUserMapper.class), Mappers.getMapper(ProfileMapper.class),
                mock(UserProfileResponseMapper.class), new UserStatsFactory(), mock(MemberPointsCacheService.class));
        TelegramUserDto telegram = new TelegramUserDto();
        telegram.setId(123456L);
        telegram.setUsername("returning_user");
        UserEntity original = registration.findOrCreateByTelegramUserId(telegram);
        original.setPhone("+79991234567");
        UUID oldId = original.getId();
        com.round13.backend.support.UserLifecycleDataFixture.persist(em, original);
        users.flush();
        jdbc.update("insert into phone_verification(phone) values (?)", original.getPhone());

        PanelUserLifecycleService lifecycle = new PanelUserLifecycleService(users, roles,
                mock(RefreshTokenService.class), new DeletedUserDataRepository(new NamedParameterJdbcTemplate(jdbc)));
        lifecycle.delete(UUID.randomUUID(), oldId);
        em.clear();

        assertThat(users.findTopByTelegramUserIdOrderByCreatedAtDesc(123456L)).isEmpty();
        assertThat(users.findByPhone("+79991234567")).isEmpty();
        assertThat(users.existsByNickname("returning_user")).isFalse();
        assertThat(users.findAllWithRole()).isEmpty();
        assertThat(users.findUserProfileBundle(oldId)).isEmpty();
        assertThat(profiles.findByUserId(oldId)).isEmpty();
        assertThat(stats.findById(oldId)).isEmpty();
        assertThat(jdbc.queryForObject("select count(*) from phone_verification", Integer.class)).isZero();
        for (String table : new String[]{"shop_orders", "shop_order_items", "shop_order_training_requests",
                "user_entitlements", "club_event_participants", "user_trainer_links"}) {
            assertThat(jdbc.queryForObject("select count(*) from " + table, Integer.class)).as(table).isZero();
        }
        assertThat(jdbc.queryForObject("select count(*) from club_events where created_by_user_id = ? and trainer_user_id is null",
                Integer.class, oldId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select count(*) from shop_products where trainer_id is not null", Integer.class)).isZero();
        UserEntity tombstone = users.findById(oldId).orElseThrow();
        tombstone.reactivate();
        assertThat(tombstone.isDeleted()).isTrue();

        UserEntity replacement = registration.findOrCreateByTelegramUserId(telegram);
        replacement.setPhone("+79991234567");
        users.flush();
        assertThat(replacement.getId()).isNotEqualTo(oldId);
        assertThat(replacement.getStatus()).isEqualTo(UserStatus.PROFILE_INCOMPLETE);
        assertThat(profiles.findByUserId(replacement.getId()).orElseThrow().isProfileCompleted()).isFalse();
        assertThat(users.findByPhone("+79991234567").orElseThrow().getId()).isEqualTo(replacement.getId());
    }
}
