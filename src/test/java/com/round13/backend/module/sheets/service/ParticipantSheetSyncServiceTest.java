package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
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
    void replacesManualAndDuplicateRowsWithOnlyDbParticipantsAndTrainerLookup() {
        var spaces = mock(GoogleSheetSpaceRepository.class);
        var gateway = mock(GoogleSheetsGateway.class);
        var users = mock(UserRepository.class);
        var profiles = mock(ProfileRepository.class);
        var links = mock(UserTrainerLinkRepository.class);
        var service = new ParticipantSheetSyncService(spaces, gateway, users, profiles, links);
        var space = new GoogleSheetSpaceEntity();
        var student = new UserEntity(); student.setId(UUID.randomUUID()); student.setStatus(UserStatus.ACTIVE);
        student.setNickname("recoilbee"); student.setPhone("+79991234567");
        var trainer = new UserEntity(); trainer.setId(UUID.randomUUID()); trainer.setTrainer(true);
        trainer.setStatus(UserStatus.ACTIVE); trainer.setNickname("Tima coach");
        var trainerProfile = new ProfileEntity(); trainerProfile.setUser(trainer);
        trainerProfile.setSurname("Иванов"); trainerProfile.setFirstName("Тимур");
        when(spaces.findActiveForUpdate()).thenReturn(Optional.of(space));
        when(users.findAllWithRole()).thenReturn(List.of(student, trainer));
        when(profiles.findByUserIdIn(any())).thenReturn(List.of(trainerProfile));
        when(gateway.readRows(space, "'Участники'!A:ZZ")).thenReturn(List.of(
                List.of("user_id", "Ник", "sync_status"),
                List.of(student.getId().toString(), "recoilbee", "Синхронизирован"),
                List.of(student.getId().toString(), "recoilbee", "Дубликат user_id"),
                List.of("", "manual", "Нет пользователя БД"),
                List.of(trainer.getId().toString(), "Tima coach", "Синхронизирован")));
        var result = service.syncActive();
        assertThat(result.activeParticipants()).isEqualTo(1);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<List<Object>>> participants = ArgumentCaptor.forClass(List.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<List<Object>>> trainers = ArgumentCaptor.forClass(List.class);
        verify(gateway).replaceParticipantRows(eq(space), participants.capture(), trainers.capture());
        assertThat(participants.getValue()).hasSize(2);
        assertThat(participants.getValue().get(1)).contains(student.getId().toString(), "recoilbee");
        assertThat(trainers.getValue()).hasSize(2);
        assertThat(trainers.getValue().get(1)).contains("Иванов Тимур", trainer.getId().toString());
    }
}
