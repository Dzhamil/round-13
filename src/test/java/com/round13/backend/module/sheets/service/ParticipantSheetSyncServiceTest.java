package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ParticipantSheetSyncServiceTest {
    @Test
    void exportsAllAccountsByIdWithOnlyExplicitNamePartsAndPreservesUnmanagedCells() {
        var spaces = mock(GoogleSheetSpaceRepository.class);
        var gateway = mock(GoogleSheetsGateway.class);
        var users = mock(UserRepository.class);
        var profiles = mock(ProfileRepository.class);
        var service = new ParticipantSheetSyncService(spaces, gateway, users, profiles);
        var space = new GoogleSheetSpaceEntity();
        var user = new UserEntity(); user.setId(UUID.randomUUID()); user.setStatus(UserStatus.ACTIVE);
        user.setNickname("nickname"); user.setPhone("+79991234567");
        var profile = new ProfileEntity(); profile.setUser(user); profile.setFullName("Legacy Display Name");
        when(spaces.findActiveForUpdate()).thenReturn(Optional.of(space));
        when(users.findAllWithRole()).thenReturn(List.of(user));
        when(profiles.findByUserIdIn(any())).thenReturn(List.of(profile));
        when(gateway.readRows(space, "'Участники'!A:ZZ")).thenReturn(List.of(
                List.of("user_id", "Фамилия", "Имя", "Отчество", "Заметки", "Ник"),
                List.of(user.getId().toString(), "stale", "stale", "stale", "=1+1", "old")));
        var result = service.syncActive();
        assertThat(result.activeParticipants()).isOne();
        assertThat(result.addedRows()).isZero();
        assertThat(service.syncActive().addedRows()).isZero();
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<GoogleSheetsGateway.ValueUpdate>> updates = ArgumentCaptor.forClass(List.class);
        verify(gateway, times(2)).updateValues(eq(space), updates.capture());
        var cells = updates.getValue().stream().collect(java.util.stream.Collectors.toMap(
                GoogleSheetsGateway.ValueUpdate::range, update -> update.values().getFirst().getFirst()));
        assertThat(cells).containsEntry("'Участники'!B2", "").containsEntry("'Участники'!C2", "")
                .containsEntry("'Участники'!D2", "").containsEntry("'Участники'!F2", "nickname")
                .doesNotContainKey("'Участники'!E2");
        assertThat(cells.values()).contains("Legacy Display Name");
        verify(gateway, never()).replaceRows(any(), any(), any());
        verify(gateway, never()).appendRows(any(), any(), any());
        verify(users, never()).save(any());
    }
}
