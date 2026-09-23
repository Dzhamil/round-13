package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

import java.time.*;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(OutputCaptureExtension.class)
class Schedule2AttendanceSheetWriterTest {
    final GoogleSheetSpaceRepository spaces = mock(GoogleSheetSpaceRepository.class);
    final GoogleSheetsGateway gateway = mock(GoogleSheetsGateway.class);
    final TrainerSheetUserResolver users = mock(TrainerSheetUserResolver.class);
    final Map<String, Set<UUID>> names = new HashMap<>();
    TrainerSheetUserResolver.Directory directory;
    final Schedule2AttendanceSheetWriter service = new Schedule2AttendanceSheetWriter(spaces, gateway,
            new GoogleSheetDataParser(), users, new AttendanceSheetUpdatePlan());
    final GoogleSheetSpaceEntity space = new GoogleSheetSpaceEntity();
    final TrainingSessionEntity training = new TrainingSessionEntity();
    final UserEntity coach = user(), ivan = user(), boxer = user();
    List<List<String>> rows;
    List<TrainingParticipantEntity> participants;

    @BeforeEach void setup() {
        space.setSpreadsheetId("source"); space.setCredentialsEnvVar("TEST");
        training.setId(UUID.randomUUID()); training.setCoach(coach);
        training.setSheetImportSpreadsheetId("source"); training.setSheetImportTrainingId(1);
        training.setSheetImportDate(LocalDateTime.of(2026, 9, 24, 18, 30));
        rows = TrainerSheetImportIntegrationTest.rows();
        participants = List.of(participant(ivan, AttendanceStatus.PRESENT), participant(boxer, AttendanceStatus.ABSENT));
        when(spaces.findByActiveTrue()).thenReturn(Optional.of(space));
        coach.setTrainer(true);
        names.put("иван иванов", Set.of(ivan.getId())); names.put("boxer", Set.of(boxer.getId()));
        directory = new TrainerSheetUserResolver.Directory(Map.of(coach.getId(), coach, ivan.getId(), ivan, boxer.getId(), boxer), names, Map.of(), new com.round13.backend.shared.phone.RussianPhoneNormalizer());
        when(users.load()).thenReturn(directory);
        when(gateway.readRows(space, "'Тренеры'!A:Z")).thenReturn(trainers("Coach's sheet"));
        when(gateway.readRows(space, "'Coach''s sheet'")).thenAnswer(call -> rows);
    }

    @Test void updatesOnlyExactAttendedCellsWithRawBooleansAndNeverAppends() {
        service.sync(training, participants, coach.getId());
        service.sync(training, participants, coach.getId());
        verify(gateway, times(2)).updateValues(space, List.of(
                new GoogleSheetsGateway.ValueUpdate("'Coach''s sheet'!F18", List.of(List.of(true))),
                new GoogleSheetsGateway.ValueUpdate("'Coach''s sheet'!F20", List.of(List.of(false)))));
        verify(gateway, never()).appendRows(any(), any(), any());
        verify(gateway, never()).replaceRows(any(), any(), any());
        verify(users, times(2)).load();
    }

    @Test void dateOnlyAndMovedStudentRowsResolveFreshCoordinates() {
        training.setSheetImportDate(LocalDateTime.of(2026, 9, 22, 0, 0));
        Collections.swap(rows, 17, 19);
        service.sync(training, participants, coach.getId());
        verify(gateway).updateValues(space, List.of(
                new GoogleSheetsGateway.ValueUpdate("'Coach''s sheet'!H20", List.of(List.of(true))),
                new GoogleSheetsGateway.ValueUpdate("'Coach''s sheet'!H18", List.of(List.of(false)))));
    }

    @Test void gidResolvesRenamedTab() {
        when(gateway.readRows(space, "'Тренеры'!A:Z")).thenReturn(trainers("https://docs.google.com/spreadsheets/d/source/edit#gid=42"));
        when(gateway.sheetTitleById(space, 42)).thenReturn("Renamed");
        when(gateway.readRows(space, "'Renamed'")).thenReturn(rows);
        service.sync(training, participants, coach.getId());
        verify(gateway).updateValues(eq(space), argThat(u -> u.getFirst().range().equals("'Renamed'!F18")));
    }

    @Test void disabledFlagDoesNotBlockAttendanceDelivery() {
        rows.get(1).set(2, "FALSE");
        assertThat(service.sync(training, participants, coach.getId())).isTrue();
        verify(gateway).updateValues(any(), any());
    }

    @Test void missingStudentAbortsEntireBatchWithDiagnostic(CapturedOutput output) {
        rows.set(19, List.of());
        service.sync(training, participants, coach.getId());
        assertThat(output.getOut()).contains("Не найден ученик", boxer.getId().toString());
        verify(gateway, never()).updateValues(any(), any());
    }

    @Test void unknownAndAmbiguousStudentsNeverReceiveWrites(CapturedOutput output) {
        names.put("boxer", Set.of(boxer.getId(), ivan.getId()));
        service.sync(training, participants, coach.getId());
        assertThat(output.getOut()).contains("Неоднозначный ученик");
        verify(gateway, never()).updateValues(any(), any());
    }

    @Test void missingDateOrTrainingNeverFallsBackToOtherCells(CapturedOutput output) {
        training.setSheetImportDate(LocalDateTime.of(2026, 9, 23, 18, 30));
        service.sync(training, participants, coach.getId());
        training.setSheetImportTrainingId(999);
        service.sync(training, participants, coach.getId());
        assertThat(output.getOut()).contains("Не найдена однозначная дата", "тренировка ID 999");
        verify(gateway, never()).updateValues(any(), any());
    }

    @Test void duplicateTrainerOrStudentAbortsBatch(CapturedOutput output) {
        var duplicate = new ArrayList<>(trainers("Coach's sheet")); duplicate.add(duplicate.getLast());
        when(gateway.readRows(space, "'Тренеры'!A:Z")).thenReturn(duplicate);
        service.sync(training, participants, coach.getId());
        when(gateway.readRows(space, "'Тренеры'!A:Z")).thenReturn(trainers("Coach's sheet"));
        rows.add(rows.get(17));
        service.sync(training, participants, coach.getId());
        assertThat(output.getOut()).contains("однозначная активная строка тренера", "Повторный ученик");
        verify(gateway, never()).updateValues(any(), any());
    }

    @Test void externalFailureIsLoggedWithoutThrowing(CapturedOutput output) {
        doThrow(new IllegalStateException("transport unavailable")).when(gateway).updateValues(any(), any());
        assertThatCode(() -> service.sync(training, participants, coach.getId())).doesNotThrowAnyException();
        assertThat(output.getOut()).contains("DB attendance retained", "transport unavailable", "sourceTraining=1");
    }

    @Test void manualTrainingSkipsAllGoogleAndIdentityWork() {
        training.setSheetImportSpreadsheetId(null);
        service.sync(training, participants, coach.getId());
        verifyNoInteractions(spaces, gateway, users);
    }

    @Test void changedSpreadsheetOrMissingTabIsDiagnosed(CapturedOutput output) {
        space.setSpreadsheetId("other"); service.sync(training, participants, coach.getId());
        space.setSpreadsheetId("source");
        when(gateway.readRows(space, "'Coach''s sheet'")).thenThrow(new IllegalArgumentException("tab missing"));
        service.sync(training, participants, coach.getId());
        assertThat(output.getOut()).contains("больше не активна", "tab missing");
        verify(gateway, never()).updateValues(any(), any());
    }

    @Test void selectsAnotherTrainingByIdDespiteDifferentPhysicalOrder() {
        names.put("гость", Set.of(ivan.getId()));
        training.setSheetImportTrainingId(2);
        training.setSheetImportDate(LocalDateTime.of(2026, 9, 25, 0, 0));
        service.sync(training, List.of(participants.getFirst()), coach.getId());
        verify(gateway).updateValues(space, List.of(new GoogleSheetsGateway.ValueUpdate("'Coach''s sheet'!E12", List.of(List.of(true)))));
    }

    @Test void followsMovedDateColumnsBeyondZWithoutTouchingPayment() {
        for (int row : List.of(15, 16, 17, 19)) {
            while (rows.get(row).size() < 30) rows.get(row).add("");
            rows.get(row).set(28, rows.get(row).get(4)); rows.get(row).set(29, rows.get(row).get(5));
            rows.get(row).set(4, ""); rows.get(row).set(5, "");
        }
        service.sync(training, participants, coach.getId());
        verify(gateway).updateValues(space, List.of(
                new GoogleSheetsGateway.ValueUpdate("'Coach''s sheet'!AD18", List.of(List.of(true))),
                new GoogleSheetsGateway.ValueUpdate("'Coach''s sheet'!AD20", List.of(List.of(false)))));
    }

    private List<List<String>> trainers(String title) {
        return List.of(List.of("ФИО", "user_id", "Личный лист"), List.of("Coach", coach.getId().toString(), title));
    }
    private static UserEntity user() { var u = new UserEntity(); u.setId(UUID.randomUUID()); return u; }
    private TrainingParticipantEntity participant(UserEntity user, AttendanceStatus status) {
        var p = new TrainingParticipantEntity(); p.setId(UUID.randomUUID()); p.setSession(training); p.setUser(user); p.setAttendanceStatus(status); return p;
    }
}
