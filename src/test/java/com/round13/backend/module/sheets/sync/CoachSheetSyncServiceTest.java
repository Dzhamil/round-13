package com.round13.backend.module.sheets.sync;

import com.round13.backend.domain.GoogleSheetSpaceEntity;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import com.round13.backend.module.sheets.service.GoogleSheetsGateway;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class CoachSheetSyncServiceTest {
    private final GoogleSheetSpaceRepository spaces = mock(GoogleSheetSpaceRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final ProfileRepository profiles = mock(ProfileRepository.class);
    private final CoachSheetChangeRepository changes = mock(CoachSheetChangeRepository.class);
    private final GoogleSheetsGateway gateway = mock(GoogleSheetsGateway.class);
    private final CoachSheetSyncService service = new CoachSheetSyncService(spaces, users, profiles, changes,
            new CoachSheetPlan(new RussianPhoneNormalizer()), gateway);

    @Test
    void failedWriteRetainsDurableChangesAndRetryUsesCurrentActiveSpace() {
        var space = new GoogleSheetSpaceEntity(); space.setCredentialsEnvVar("SHEETS_TEST");
        var user = CoachSheetPlanTest.user("ADMIN", "+79390000001");
        var pending = List.of(new CoachSheetChange(user.getId(), user.getPhone()));
        when(spaces.findActiveForUpdate()).thenReturn(Optional.of(space));
        when(users.findAllWithRole()).thenReturn(List.of(user));
        when(changes.findAll()).thenReturn(pending);
        when(gateway.readRows(space, "'Тренеры'!A:Z")).thenReturn(List.of());
        doThrow(new IllegalStateException("unavailable")).doNothing().when(gateway).writeCells(eq(space), anyMap());
        assertThatThrownBy(service::syncActive).isInstanceOf(IllegalStateException.class);
        verify(changes, never()).deleteAll(anyList());
        service.syncActive();
        verify(changes).deleteAll(pending);
        verify(spaces, times(2)).findActiveForUpdate();
    }

    @Test
    void unconfiguredSpaceDoesNotWriteOrDiscardChanges() {
        when(spaces.findActiveForUpdate()).thenReturn(Optional.of(new GoogleSheetSpaceEntity()));
        service.syncActive();
        verifyNoInteractions(gateway, changes, users, profiles);
    }
}
