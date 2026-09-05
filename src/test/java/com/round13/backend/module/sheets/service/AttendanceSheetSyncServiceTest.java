package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AttendanceSheetSyncServiceTest {
    @Test
    void appendsAttendanceToRegistryWithoutReplacingEditableParticipantTables() {
        var spaces = mock(GoogleSheetSpaceRepository.class);
        var gateway = mock(GoogleSheetsGateway.class);
        var profiles = mock(ProfileRepository.class);
        var service = new AttendanceSheetSyncService(spaces, gateway, profiles);
        var space = new GoogleSheetSpaceEntity(); space.setCredentialsEnvVar("GOOGLE_CREDENTIALS");
        when(spaces.findByActiveTrue()).thenReturn(Optional.of(space));
        UserEntity trainer = user("Dzhamill"); UserEntity participant = user("+79990001122");
        TrainingSessionEntity training = new TrainingSessionEntity(); training.setId(UUID.randomUUID());
        training.setCoach(trainer); training.setTitle("Personal"); training.setType(TrainingType.PERSONAL);
        training.setStartTime(OffsetDateTime.parse("2026-09-07T10:00:00+03:00"));
        TrainingParticipantEntity attendance = new TrainingParticipantEntity(); attendance.setId(UUID.randomUUID());
        attendance.setSession(training); attendance.setUser(participant); attendance.setAttendanceStatus(AttendanceStatus.PRESENT);

        service.sync(training, List.of(attendance), trainer.getId());

        verify(gateway).appendRows(eq(space), eq("Реестр"), argThat(rows -> rows.size() == 1));
        verify(gateway, never()).replaceRows(any(), anyString(), anyList());
    }

    private UserEntity user(String phone) { UserEntity user=new UserEntity(); user.setId(UUID.randomUUID()); user.setPhone(phone); return user; }
}
