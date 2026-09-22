package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.GoogleSheetSpaceEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import com.round13.backend.module.sheets.integration.GoogleSheetsClientFactory;
import com.round13.backend.module.sheets.integration.GoogleSheetsClient;
import com.round13.backend.module.sheets.integration.ParticipantSheetWriter;
import com.google.api.services.sheets.v4.model.SheetProperties;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class GoogleSheetSyncServiceTest {
    @Test
    void syncsTrainerAndParticipantVerificationAndReturnsTrainerSchedule() {
        var spaces = mock(GoogleSheetSpaceRepository.class);
        var gateway = mock(GoogleSheetsGateway.class);
        var users = mock(UserRepository.class);
        var importer = mock(TrainerSheetImportService.class);
        var service = new GoogleSheetSyncService(spaces, gateway, new GoogleSheetDataParser(), users,
                new RussianPhoneNormalizer(), importer);
        var space = new GoogleSheetSpaceEntity(); space.setCredentialsEnvVar("GOOGLE_CREDENTIALS");
        when(spaces.findByActiveTrue()).thenReturn(Optional.of(space));
        when(gateway.readRows(space, "'Тренеры'!A:Z")).thenReturn(List.of(
                List.of("Имя", "Телефон", "Прошел верификацию"),
                List.of("Dzhamill", "+7 (939) 393-09-20", "Да")));
        when(gateway.readRows(space, "'Участники'!A:Z")).thenReturn(List.of(
                List.of("Имя", "Телефон", "Прошел верификацию"),
                List.of("Participant", "+7 (999) 000-11-22", "Да")));
        when(importer.importSheet(any(), any())).thenReturn(new TrainerSheetImportService.Result("Dzhamill", "IMPORTED",
                new GoogleSheetDataParser().trainerSheet("Dzhamill", "Dzhamill", TrainerSheetParserTest.example()),
                new TrainerSheetPersistenceService.Counts(3, 5, 0, 0)));
        UserEntity trainer = user(); UserEntity participant = user();
        trainer.setPhone("+79393930920"); participant.setPhone("+79990001122");
        when(users.findByPhoneIn(anyList())).thenReturn(List.of(trainer, participant));

        var result = service.syncActive();

        assertThat(result.trainersRead()).isOne();
        assertThat(result.participantsRead()).isOne();
        assertThat(result.usersUpdated()).isEqualTo(2);
        assertThat(result.trainerSheets()).singleElement().satisfies(sheet -> {
            assertThat(sheet.trainerName()).isEqualTo("Dzhamill");
            assertThat(sheet.trainings().getFirst().title()).isEqualTo("Бокс");
            assertThat(sheet.trainings().getFirst().students()).hasSize(2);
        });
        assertThat(trainer.isPhoneVerifiedByStaff()).isTrue();
        assertThat(participant.isPhoneVerifiedByStaff()).isTrue();
        verify(users).saveAll(List.of(trainer, participant));
        verify(users, never()).findByPhone(anyString());
    }

    @Test
    void readsStructuredSheetsWithoutAnyDatabaseOrSheetWrites() {
        var spaces = mock(GoogleSheetSpaceRepository.class);
        var gateway = mock(GoogleSheetsGateway.class);
        var users = mock(UserRepository.class);
        var importer = mock(TrainerSheetImportService.class);
        var service = new GoogleSheetSyncService(spaces, gateway, new GoogleSheetDataParser(), users,
                new RussianPhoneNormalizer(), importer);
        var space = new GoogleSheetSpaceEntity();
        space.setCredentialsEnvVar("GOOGLE_CREDENTIALS");
        when(spaces.findByActiveTrue()).thenReturn(Optional.of(space));
        when(gateway.readRows(space, "'Тренеры'!A:Z")).thenReturn(List.of(
                List.of("ФИО", "Телефон", "Личный лист", "Активен"),
                List.of("Тренер", "79990000001", "Coach's sheet", "Да"),
                List.of("Неактивный", "79990000002", "Skipped", "Нет"),
                List.of("Запасной", "79990000003", "", "Да")));
        when(gateway.readRows(space, "'Coach''s sheet'")).thenReturn(TrainerSheetParserTest.example());
        when(gateway.readRows(space, "'Запасной'")).thenReturn(List.of());

        var result = service.readTrainerSheets();

        assertThat(result).hasSize(2);
        assertThat(result.getFirst().sheetName()).isEqualTo("Coach's sheet");
        assertThat(result.getFirst().trainings()).hasSize(2);
        assertThat(result.getLast().trainings()).isEmpty();
        verifyNoInteractions(users);
        verify(spaces).findByActiveTrue();
        verifyNoMoreInteractions(spaces);
        verify(gateway).readRows(space, "'Тренеры'!A:Z");
        verify(gateway).readRows(space, "'Coach''s sheet'");
        verify(gateway).readRows(space, "'Запасной'");
        verifyNoMoreInteractions(gateway);
    }

    @Test
    void reportsOneMalformedTrainerWithoutAbortingOtherTrainers() {
        var spaces = mock(GoogleSheetSpaceRepository.class);
        var gateway = mock(GoogleSheetsGateway.class);
        var users = mock(UserRepository.class);
        var importer = mock(TrainerSheetImportService.class);
        var service = new GoogleSheetSyncService(spaces, gateway, new GoogleSheetDataParser(), users,
                new RussianPhoneNormalizer(), importer);
        var space = new GoogleSheetSpaceEntity(); space.setCredentialsEnvVar("GOOGLE_CREDENTIALS");
        when(spaces.findByActiveTrue()).thenReturn(Optional.of(space));
        when(gateway.readRows(space, "'Тренеры'!A:Z")).thenReturn(List.of(
                List.of("ФИО", "Телефон"), List.of("Тренер", "79990000001"), List.of("Другой", "79990000002")));
        when(gateway.readRows(space, "'Участники'!A:Z")).thenReturn(List.of());
        when(importer.importSheet(any(), any())).thenThrow(new IllegalArgumentException("головная таблица, строка 4"))
                .thenReturn(new TrainerSheetImportService.Result("Другой", "IMPORTED", null,
                        new TrainerSheetPersistenceService.Counts(1, 2, 0, 0)));

        var result = service.syncActive();

        assertThat(result.imports()).extracting(item -> item.status()).containsExactly("ERROR", "IMPORTED");
        assertThat(result.imports().getFirst().error()).contains("строка 4");
        assertThat(result.imports().getFirst().trainer()).isEqualTo("Тренер");
        verify(importer, times(2)).importSheet(any(), any());
    }

    @Test
    void readsProvisionedUrlThroughMetadataIntoStructuredModelWithoutWrites() {
        var spaces = mock(GoogleSheetSpaceRepository.class);
        var users = mock(UserRepository.class);
        var factory = mock(GoogleSheetsClientFactory.class);
        var client = mock(GoogleSheetsClient.class);
        var writer = mock(ParticipantSheetWriter.class);
        var gateway = new GoogleSheetsHttpGateway(factory, writer);
        var space = new GoogleSheetSpaceEntity();
        space.setSpreadsheetId("spreadsheet-id");
        space.setCredentialsEnvVar("GOOGLE_CREDENTIALS");
        when(factory.open(space)).thenReturn(client);
        // Obtain exactly the link emitted by current provisioning, before the read-only phase.
        when(client.requireSheet("Coach's name · abcdef12")).thenReturn(
                new SheetProperties()
                        .setSheetId(123456).setTitle("Coach's name · abcdef12"));
        String link = gateway.ensureTrainerSpace(space, "Coach's name", "abcdef12-0000");
        assertThat(link).isEqualTo("https://docs.google.com/spreadsheets/d/spreadsheet-id/edit#gid=123456");
        clearInvocations(client, factory);
        when(spaces.findByActiveTrue()).thenReturn(Optional.of(space));
        when(client.readRows("'Тренеры'!A:Z")).thenReturn(List.of(
                List.of("ФИО", "Телефон", "Личный лист", "Активен"),
                List.of("Тренер", "79990000001", link, "Да")));
        // A renamed tab proves that neither trainer name nor the old title is assumed.
        when(client.properties()).thenReturn(List.of(
                new SheetProperties().setSheetId(1).setTitle("Other"),
                new SheetProperties()
                        .setSheetId(123456).setTitle("Renamed coach's sheet")));
        when(client.readRows("'Renamed coach''s sheet'")).thenReturn(TrainerSheetParserTest.example());
        var importer = mock(TrainerSheetImportService.class);
        var service = new GoogleSheetSyncService(spaces, gateway, new GoogleSheetDataParser(), users,
                new RussianPhoneNormalizer(), importer);

        var result = service.readTrainerSheets();

        assertThat(result).containsExactly(new GoogleSheetDataParser().trainerSheet(
                "Тренер", "Renamed coach's sheet", TrainerSheetParserTest.example()));
        assertThat(result.getFirst().trainings()).hasSize(2);
        var date = result.getFirst().trainings().getFirst().students().getFirst().dates().getFirst();
        assertThat(date.paid()).isTrue();
        assertThat(date.attended()).isFalse();
        verify(client).readRows("'Тренеры'!A:Z");
        verify(client).properties();
        verify(client).readRows("'Renamed coach''s sheet'");
        verifyNoMoreInteractions(client);
        verifyNoInteractions(users, writer);
        verify(spaces).findByActiveTrue();
        verifyNoMoreInteractions(spaces);
    }

    private UserEntity user() { UserEntity user = new UserEntity(); user.setId(UUID.randomUUID()); return user; }
}
