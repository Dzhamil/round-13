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
    private final com.round13.backend.module.sheets.sync.CoachSheetChanges changes = mock(com.round13.backend.module.sheets.sync.CoachSheetChanges.class);
    private final PanelUsersService service = new PanelUsersService(users, roles, profiles, changes);

    @Test
    void panelMembershipIncludesAdminAndIncompleteCoachButNotDeletedOrAthlete() {
        UserEntity admin = user(); admin.getRole().setCode("ADMIN");
        UserEntity coach = user(); coach.getRole().setCode("COACH"); coach.setStatus(UserStatus.PROFILE_INCOMPLETE);
        UserEntity deleted = user(); deleted.getRole().setCode("COACH"); deleted.setStatus(UserStatus.DELETED);
        UserEntity athlete = user();
        when(users.findAllWithRole()).thenReturn(List.of(admin, coach, deleted, athlete));
        assertThat(service.getUsers()).extracting(item -> item.isCoach()).containsExactly(true, true, false, false);
    }

    @Test
    void roleChangesQueueSynchronizationAndImmediatelyChangePanelMembership() {
        UserEntity user = user();
        RoleEntity coach = new RoleEntity(); coach.setCode("COACH");
        RoleEntity admin = new RoleEntity(); admin.setCode("ADMIN");
        RoleEntity athlete = user.getRole();
        when(users.findByIdWithRole(user.getId())).thenReturn(java.util.Optional.of(user));
        when(users.findAllWithRole()).thenReturn(List.of(user));
        when(roles.findByCode("COACH")).thenReturn(java.util.Optional.of(coach));
        when(roles.findByCode("ADMIN")).thenReturn(java.util.Optional.of(admin));
        when(roles.findByCode("ATHLETE")).thenReturn(java.util.Optional.of(athlete));
        UUID actor = UUID.randomUUID();
        service.grantCoach(actor, user.getId());
        assertThat(service.getUsers().getFirst().isCoach()).isTrue();
        service.grantAdmin(actor, user.getId());
        assertThat(service.getUsers().getFirst().isCoach()).isTrue();
        service.revokeAdmin(actor, user.getId());
        assertThat(service.getUsers().getFirst().isCoach()).isTrue();
        service.revokeCoach(actor, user.getId());
        assertThat(service.getUsers().getFirst().isCoach()).isFalse();
        verify(changes, times(4)).record(user, user.getPhone());
    }

    @Test
    void currentPanelEndpointSerializesSharedCoachMembership() throws Exception {
        UserEntity admin = user(); admin.getRole().setCode("ADMIN");
        when(users.findAllWithRole()).thenReturn(List.of(admin));
        var controller = new com.round13.backend.module.adminpanel.controller.PanelUsersController(service,
                mock(PanelManualUserService.class), mock(PanelTemporaryPasswordService.class));
        var mvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(controller).build();
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/panel/users"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$[0].roleCode").value("ADMIN"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$[0].coach").value(true));
    }

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
