package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.profile.service.ProfileServiceUtil;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AllUsersSheetSyncServiceTest {
    final AllUsersSheetMapper mapper = new AllUsersSheetMapper(new ProfileServiceUtil());
    UserEntity user(String roleCode) {
        var role = new RoleEntity(); role.setCode(roleCode);
        var user = new UserEntity(); user.setId(UUID.randomUUID()); user.setRole(role);
        user.setStatus(UserStatus.ACTIVE); user.setNickname("Nickname With Spaces");
        return user;
    }
    @Test void structuredNamesAndIndependentRoles() {
        var user = user("ADMIN");
        var row = mapper.map(user, null, "", "now");
        assertEquals(List.of("", "", "", "Nickname With Spaces"), row.subList(0, 4));
        assertEquals("Нет", row.get(7)); assertEquals("Да", row.get(8));
        assertEquals("Требуется верификация", row.get(10));
        user.setTrainer(true); user.setStatus(UserStatus.BLOCKED);
        var profile = new ProfileEntity(); profile.setSurname("Surname"); profile.setFirstName("First");
        profile.setFullName("Legacy Name");
        row = mapper.map(user, profile, "trainer-id", "later");
        assertEquals("Surname First", row.get(3)); assertEquals("Да", row.get(7));
        assertEquals("BLOCKED", row.get(9)); assertEquals("trainer-id", row.get(12));
        profile.setSurname(null); profile.setFirstName(null);
        assertEquals("Legacy Name", mapper.map(user, profile, "", "now").get(3));
    }
    @Test void snapshotRemovesFakeDuplicateAndMissingRowsAndIsIdempotent() {
        var user = user("ATHLETE");
        var source = Map.of(user.getId(), mapper.map(user, null, "", "now"));
        var old = List.of(List.of("old"), List.of("fake"), List.of(user.getId().toString()), List.of("duplicate"));
        var first = AllUsersSheetPlan.reconcile(source, old);
        assertEquals(4, first.values().size());
        assertEquals(user.getId().toString(), first.values().get(1).get(1));
        assertTrue(first.values().get(2).stream().allMatch(""::equals));
        var previous = first.values().stream().map(r -> r.stream().map(Object::toString).toList()).toList();
        assertEquals(first, AllUsersSheetPlan.reconcile(source, previous));
        user.setNickname("updated"); user.setPhone("+79991234567");
        var updated = AllUsersSheetPlan.reconcile(Map.of(user.getId(), mapper.map(user, null, "", "later")), previous);
        assertEquals("updated", updated.values().get(1).get(6));
        assertEquals("+79991234567", updated.values().get(1).get(7));
        assertTrue(AllUsersSheetPlan.reconcile(Map.of(), previous).values().get(1).stream().allMatch(""::equals));
    }
    @Test void usesExactPanelSourceIncludingSoftDeletedAndPropagatesFailure() {
        var spaces = mock(GoogleSheetSpaceRepository.class); var gateway = mock(GoogleSheetsGateway.class);
        var users = mock(UserRepository.class); var profiles = mock(ProfileRepository.class);
        var links = mock(UserTrainerLinkRepository.class);
        var space = new GoogleSheetSpaceEntity(); space.setSpreadsheetId("target");
        when(spaces.findActiveForUpdate()).thenReturn(Optional.of(space));
        var deleted = user("ADMIN"); deleted.setStatus(UserStatus.DELETED);
        when(users.findAllWithRole()).thenReturn(List.of(deleted));
        when(profiles.findByUserIdIn(any())).thenReturn(List.of()); when(links.findAll()).thenReturn(List.of());
        when(gateway.readRows(any(), any())).thenReturn(List.of());
        var service = new AllUsersSheetSyncService(spaces, gateway, users, profiles, links, mapper);
        assertEquals(1, service.syncActive().sourceUsers());
        verify(users).findAllWithRole();
        verify(gateway).updateValues(eq(space), argThat(updates -> updates.getFirst().values().get(1).get(11).equals("DELETED")));
        doThrow(new IllegalStateException("unavailable")).when(gateway).updateValues(any(), any());
        assertThrows(IllegalStateException.class, service::syncActive);
    }
}
