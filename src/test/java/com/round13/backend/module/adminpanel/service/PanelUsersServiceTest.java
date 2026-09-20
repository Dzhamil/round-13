package com.round13.backend.module.adminpanel.service;

import com.round13.backend.support.ProfileIdentityFixture;
import com.round13.backend.domain.*;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.*;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class PanelUsersServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final ProfileRepository profiles = mock(ProfileRepository.class);
    private final RoleRepository roles = mock(RoleRepository.class);
    private final PanelUsersService service = new PanelUsersService(users, roles, profiles);

    @Test
    void batchesProfilesAndRetainsUsersWithoutProfiles() {
        UserEntity first = user();
        UserEntity second = user();
        ProfileEntity profile = new ProfileEntity();
        profile.setUser(first);
        profile.setSurname(ProfileIdentityFixture.SURNAME);
        profile.setFirstName(ProfileIdentityFixture.FIRST_NAME);
        profile.setPatronymic(ProfileIdentityFixture.PATRONYMIC);
        profile.setFullName("Legacy");
        when(users.findAllWithRole()).thenReturn(List.of(first, second));
        when(profiles.findByUserIdIn(List.of(first.getId(), second.getId()))).thenReturn(List.of(profile));

        var result = service.getUsers();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getSurname()).isEqualTo(ProfileIdentityFixture.SURNAME);
        assertThat(result.get(0).getFirstName()).isEqualTo(ProfileIdentityFixture.FIRST_NAME);
        assertThat(result.get(0).getPatronymic()).isEqualTo(ProfileIdentityFixture.PATRONYMIC);
        assertThat(result.get(0).getFullName()).isEqualTo("Legacy");
        assertThat(result.get(1).getId()).isEqualTo(second.getId());
        assertThat(result.get(1).getSurname()).isNull();
        assertThat(result.get(1).getFullName()).isNull();
        verify(profiles).findByUserIdIn(List.of(first.getId(), second.getId()));
        verifyNoMoreInteractions(profiles);
    }

    @Test
    void emptyListDoesNotQueryProfiles() {
        when(users.findAllWithRole()).thenReturn(List.of());
        assertThat(service.getUsers()).isEmpty();
        verifyNoInteractions(profiles);
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.CsvSource({"ATHLETE,false", "COACH,true", "ADMIN,false", "ADMIN,true"})
    void trainerIdentitySurvivesAdminGrantAndRevoke(String code, boolean trainer) {
        UserEntity user = target(code, trainer);
        service.grantAdmin(UUID.randomUUID(), user.getId());
        assertThat(user.getRole().getCode()).isEqualTo("ADMIN");
        assertThat(user.isTrainer()).isEqualTo(trainer);
        service.revokeAdmin(UUID.randomUUID(), user.getId());
        assertThat(user.getRole().getCode()).isEqualTo(trainer ? "COACH" : "ATHLETE");
        assertThat(user.isTrainer()).isEqualTo(trainer);
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings = {"ATHLETE", "COACH", "ADMIN"})
    void trainerActionsAndPanelResponseUseExplicitIdentity(String code) {
        UserEntity user = target(code, "COACH".equals(code));
        when(users.findAllWithRole()).thenReturn(List.of(user));
        service.grantCoach(UUID.randomUUID(), user.getId());
        assertThat(service.getUsers().getFirst().isTrainer()).isTrue();
        assertThat(user.getRole().getCode()).isEqualTo("ADMIN".equals(code) ? "ADMIN" : "COACH");
        service.revokeCoach(UUID.randomUUID(), user.getId());
        assertThat(service.getUsers().getFirst().isTrainer()).isFalse();
        assertThat(user.getRole().getCode()).isEqualTo("ADMIN".equals(code) ? "ADMIN" : "ATHLETE");
    }

    private UserEntity target(String code, boolean trainer) {
        for (String roleCode : List.of("ATHLETE", "COACH", "ADMIN")) {
            RoleEntity role = new RoleEntity();
            role.setCode(roleCode);
            when(roles.findByCode(roleCode)).thenReturn(java.util.Optional.of(role));
        }
        UserEntity user = user();
        user.setRole(roles.findByCode(code).orElseThrow());
        user.setTrainer(trainer);
        when(users.findByIdWithRole(user.getId())).thenReturn(java.util.Optional.of(user));
        return user;
    }

    private UserEntity user() {
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setStatus(UserStatus.ACTIVE);
        RoleEntity role = new RoleEntity();
        role.setCode("ATHLETE");
        user.setRole(role);
        return user;
    }
}
