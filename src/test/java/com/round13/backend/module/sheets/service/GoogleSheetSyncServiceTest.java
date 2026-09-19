package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.GoogleSheetSpaceEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class GoogleSheetSyncServiceTest {
    @Test
    void syncsTrainerAndParticipantVerificationAndReturnsTrainerSchedule() {
        var spaces = mock(GoogleSheetSpaceRepository.class);
        var gateway = mock(GoogleSheetsGateway.class);
        var users = mock(UserRepository.class);
        var service = new GoogleSheetSyncService(spaces, gateway, new GoogleSheetDataParser(), users,
                new RussianPhoneNormalizer());
        var space = new GoogleSheetSpaceEntity(); space.setCredentialsEnvVar("GOOGLE_CREDENTIALS");
        when(spaces.findByActiveTrue()).thenReturn(Optional.of(space));
        when(gateway.readRows(space, "'Тренеры'!A:Z")).thenReturn(List.of(
                List.of("Имя", "Телефон", "Прошел верификацию"),
                List.of("Dzhamill", "+7 (939) 393-09-20", "Да")));
        when(gateway.readRows(space, "'Участники'!A:Z")).thenReturn(List.of(
                List.of("Имя", "Телефон", "Прошел верификацию"),
                List.of("Participant", "+7 (999) 000-11-22", "Да")));
        when(gateway.readRows(space, "'Dzhamill'!A:Z")).thenReturn(List.of(
                List.of("Дата", "Время", "Тип", "Название"),
                List.of("2026-09-07", "10:00", "Персональная", "Boxing")));
        UserEntity trainer = user(); UserEntity participant = user();
        when(users.findByPhone("+79393930920")).thenReturn(Optional.of(trainer));
        when(users.findByPhone("+79990001122")).thenReturn(Optional.of(participant));

        var result = service.syncActive();

        assertThat(result.trainersRead()).isOne();
        assertThat(result.participantsRead()).isOne();
        assertThat(result.usersUpdated()).isEqualTo(2);
        assertThat(result.trainings()).singleElement().satisfies(training -> {
            assertThat(training.trainerName()).isEqualTo("Dzhamill");
            assertThat(training.title()).isEqualTo("Boxing");
        });
        assertThat(trainer.isPhoneVerifiedByStaff()).isTrue();
        assertThat(participant.isPhoneVerifiedByStaff()).isTrue();
        verify(users).save(trainer); verify(users).save(participant);
    }

    @Test
    void managedCoachWithoutScheduleOrVerificationDoesNotReadInventedTabOrRevokeVerification() {
        var spaces = mock(GoogleSheetSpaceRepository.class);
        var gateway = mock(GoogleSheetsGateway.class);
        var users = mock(UserRepository.class);
        var space = new GoogleSheetSpaceEntity(); space.setCredentialsEnvVar("SHEETS_TEST");
        when(spaces.findByActiveTrue()).thenReturn(Optional.of(space));
        when(gateway.readRows(space, "'Тренеры'!A:Z")).thenReturn(List.of(
                List.of("ФИО", "Телефон", "Round13 ID"), List.of("New Coach", "+79001112233", "id")));
        var trainer = user(); trainer.setPhoneVerifiedByStaff(true);
        when(users.findByPhone("+79001112233")).thenReturn(Optional.of(trainer));
        var service = new GoogleSheetSyncService(spaces, gateway, new GoogleSheetDataParser(), users, new RussianPhoneNormalizer());
        assertThat(service.syncActive().trainings()).isEmpty();
        assertThat(trainer.isPhoneVerifiedByStaff()).isTrue();
        verify(users, never()).save(any());
        verify(gateway).readRows(space, "'Тренеры'!A:Z");
        verify(gateway).readRows(space, "'Участники'!A:Z");
        verifyNoMoreInteractions(gateway);
    }

    @Test
    void managedVerificationUsesUuidEvenWithoutPhoneAndNeverFallsBackToAnotherPhoneOwner() {
        var spaces = mock(GoogleSheetSpaceRepository.class);
        var gateway = mock(GoogleSheetsGateway.class);
        var users = mock(UserRepository.class);
        var space = new GoogleSheetSpaceEntity(); space.setCredentialsEnvVar("SHEETS_TEST");
        var trainer = user();
        when(spaces.findByActiveTrue()).thenReturn(Optional.of(space));
        when(gateway.readRows(space, "'Тренеры'!A:Z")).thenReturn(List.of(
                List.of("ФИО", "Телефон", "Round13 ID", "Прошел верификацию"),
                List.of("Coach", "", trainer.getId().toString(), "Да"),
                List.of("Unknown ID", "+79001112233", UUID.randomUUID().toString(), "Да")));
        when(users.findById(trainer.getId())).thenReturn(Optional.of(trainer));
        var service = new GoogleSheetSyncService(spaces, gateway, new GoogleSheetDataParser(), users, new RussianPhoneNormalizer());
        var result = service.syncActive();
        assertThat(result.trainersRead()).isEqualTo(2);
        assertThat(trainer.isPhoneVerifiedByStaff()).isTrue();
        verify(users, never()).findByPhone(anyString());
        verify(users).save(trainer);
    }

    private UserEntity user() { UserEntity user = new UserEntity(); user.setId(UUID.randomUUID()); return user; }
}
