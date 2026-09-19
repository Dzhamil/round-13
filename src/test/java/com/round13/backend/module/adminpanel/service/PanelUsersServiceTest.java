package com.round13.backend.module.adminpanel.service;

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
    private final PanelUsersService service = new PanelUsersService(users, mock(RoleRepository.class), profiles);

    @Test
    void batchesProfilesAndRetainsUsersWithoutProfiles() {
        UserEntity first = user();
        UserEntity second = user();
        ProfileEntity profile = new ProfileEntity();
        profile.setUser(first);
        profile.setSurname("Иванов");
        profile.setFirstName("Иван");
        profile.setPatronymic("Иванович");
        profile.setFullName("Legacy");
        when(users.findAllWithRole()).thenReturn(List.of(first, second));
        when(profiles.findByUserIdIn(List.of(first.getId(), second.getId()))).thenReturn(List.of(profile));

        var result = service.getUsers();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getSurname()).isEqualTo("Иванов");
        assertThat(result.get(0).getFirstName()).isEqualTo("Иван");
        assertThat(result.get(0).getPatronymic()).isEqualTo("Иванович");
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
