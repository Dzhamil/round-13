package com.round13.backend.module.profile.service;

import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import com.round13.backend.domain.*;
import com.round13.backend.module.profile.dto.UpdateProfileRequest;
import com.round13.backend.module.profile.mapper.ProfileMapper;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.*;
import com.round13.backend.module.sheets.service.*;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.task.SyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.transaction.TestTransaction;
import java.time.LocalDate;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@DataJpaTest(properties = {"spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop"})
@Import({RussianPhoneNormalizer.class, ProfileAccessService.class, ProfileCommandService.class, ProfileService.class, ProfileServiceUtil.class,
        ProfileSheetSyncListener.class, ProfileSaveIntegrationTest.Config.class})
class ProfileSaveIntegrationTest {
    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(booleans = {false, true})
    void deletedIdentitiesAreAbsentFromAdminSheetsAndPublicProfileSources(boolean permanent) {
        UUID id = seed();
        var user = users.findById(id).orElseThrow();
        user.setStatus(permanent ? UserStatus.ACTIVE : UserStatus.DELETED);
        user.setPermanentlyDeleted(permanent);
        users.saveAndFlush(user);
        assertThat(users.findAllWithRole()).extracting(UserEntity::getId).doesNotContain(id);
        assertThat(users.findUserProfileBundle(id)).isEmpty();
        assertThat(users.findById(id)).isPresent();
    }

    @Test
    void legacyActiveAccountIsPersistedAsIncompleteUntilIdentitySave() {
        UUID id = seed();
        var user = users.findById(id).orElseThrow();
        user.setStatus(UserStatus.ACTIVE);
        user.setPhone(null);
        users.saveAndFlush(user);
        assertThat(access.requiresCompletion(user)).isTrue();
        users.flush();
        assertThat(jdbc.queryForObject("select status from users where id=?", String.class, id))
                .isEqualTo("PROFILE_INCOMPLETE");
        commands.updateMyProfile(id, request());
        assertThat(access.requiresCompletion(user)).isFalse();
        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @TestConfiguration
    static class Config {
        @Bean ProfileMapper profileMapper() { return Mappers.getMapper(ProfileMapper.class); }
        @Bean TaskExecutor profileSheetExecutor() { return new SyncTaskExecutor(); }
    }
    @Autowired UserRepository users;
    @Autowired RoleRepository roles;
    @Autowired ProfileRepository profiles;
    @Autowired ProfileCommandService commands;
    @Autowired ProfileService reads;
    @Autowired ProfileAccessService access;
    @Autowired JdbcTemplate jdbc;
    @MockBean ProfileEntitlementService entitlements;
    @MockBean AllUsersSheetSyncService allUsers;
    @MockBean ParticipantSheetSyncService participants;
    @MockBean TrainerSheetSyncService trainers;

    @Test
    void barbossLikeAccountPersistsBeforeExportAndSurvivesSheetsFailure() {
        UUID id = seed();
        when(allUsers.syncActive()).thenAnswer(call -> {
            assertThat(jdbc.queryForObject("select surname from profiles where user_id=?", String.class, id))
                    .isEqualTo("Иванов");
            throw new IllegalStateException("simulated transport failure");
        });
        var saved = commands.updateMyProfile(id, request());
        assertThat(saved.isProfileVerificationRequired()).isFalse();
        verifyNoInteractions(allUsers, participants, trainers);
        TestTransaction.flagForCommit();
        TestTransaction.end();
        verify(allUsers).syncActive();
        verify(participants).syncActive();
        verify(trainers).syncActive();
        assertThat(jdbc.queryForObject("select status from users where id=?", String.class, id)).isEqualTo("ACTIVE");
        assertThat(jdbc.queryForObject("select profile_completed from profiles where user_id=?", Boolean.class, id)).isTrue();
        assertThat(reads.getMe(id).getNickname()).isEqualTo("barboss_like");
        jdbc.update("delete from profiles where user_id=?", id);
        jdbc.update("delete from users where id=?", id);
    }

    @Test
    void rollbackDoesNotExport() {
        UUID id = seed();
        commands.updateMyProfile(id, request());
        TestTransaction.flagForRollback();
        TestTransaction.end();
        verifyNoInteractions(allUsers, participants, trainers);
    }

    @Test
    void repeatedReadsLeaveDatabaseExactlyUnchangedIncludingMissingProfile() throws Exception {
        UUID id = seed();
        var userBefore = jdbc.queryForMap("select * from users where id=?", id);
        var mvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(
                new com.round13.backend.module.profile.controller.ProfileController(reads, commands,
                        mock(AccountDeletionService.class), mock(WebPasswordService.class))).build();
        var principal = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(id.toString(), null);
        for (int i = 0; i < 2; i++) {
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/account/me")
                    .principal(principal)).andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk());
        }
        users.flush();
        assertThat(jdbc.queryForMap("select * from users where id=?", id)).isEqualTo(userBefore);
        assertThat(profiles.findByUserId(id)).isEmpty();
        commands.updateMyProfile(id, request());
        users.flush();
        var profileBefore = jdbc.queryForMap("select * from profiles where user_id=?", id);
        userBefore = jdbc.queryForMap("select * from users where id=?", id);
        reads.getMe(id);
        users.flush();
        assertThat(jdbc.queryForMap("select * from profiles where user_id=?", id)).isEqualTo(profileBefore);
        assertThat(jdbc.queryForMap("select * from users where id=?", id)).isEqualTo(userBefore);
    }

    private UUID seed() {
        RoleEntity role = roles.findByCode("ATHLETE").orElseGet(() -> {
            RoleEntity value = new RoleEntity();
            value.setCode("ATHLETE");
            return roles.saveAndFlush(value);
        });
        UserEntity user = new UserEntity();
        user.setRole(role);
        user.setNickname("legacy_" + UUID.randomUUID());
        user.setTelegramUserId(Math.abs(UUID.randomUUID().getMostSignificantBits()));
        user.setStatus(UserStatus.PROFILE_INCOMPLETE);
        return users.saveAndFlush(user).getId();
    }

    private UpdateProfileRequest request() {
        return new UpdateProfileRequest("Иванов", "Иван", "Иванович", "barboss_like", "+79991234567",
                true, "MALE", null, LocalDate.of(2000, 1, 1), "avatar.jpg", null, null, null);
    }
}
