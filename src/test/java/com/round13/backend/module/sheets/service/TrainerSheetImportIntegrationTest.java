package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.info.repo.TrainingSessionRepository;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.schedule2.controller.Schedule2Controller;
import com.round13.backend.module.schedule2.service.*;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import com.round13.backend.module.training.repo.TrainingParticipantRepository;
import com.round13.backend.module.user.repo.*;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import jakarta.persistence.EntityManager;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.*;
import java.util.*;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DataJpaTest(showSql = false, properties = {"spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.generate_statistics=true", "logging.level.org.hibernate.stat=OFF",
        "logging.level.org.hibernate.engine.internal.StatisticalLoggingSessionEventListener=OFF"})
@Import({TrainerSheetImportService.class, TrainerSheetPersistenceService.class, TrainerSheetUserResolver.class,
        GoogleSheetDataParser.class, RussianPhoneNormalizer.class, GoogleSheetSyncService.class, Schedule2Service.class,
        Schedule2AttendanceSheetWriter.class, AttendanceSheetUpdatePlan.class, Schedule2AttendanceCommand.class,
        Schedule2AttendanceDelivery.class, Schedule2TrainingAccess.class, Schedule2QueryService.class})
class TrainerSheetImportIntegrationTest {
    @Autowired TrainerSheetImportService importer;
    @Autowired GoogleSheetSyncService sync;
    @Autowired Schedule2Service schedule;
    @Autowired GoogleSheetSpaceRepository spaces;
    @Autowired UserRepository users;
    @Autowired ProfileRepository profiles;
    @Autowired RoleRepository roles;
    @Autowired TrainingSessionRepository sessions;
    @Autowired TrainingParticipantRepository participants;
    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager transactions;
    @MockBean GoogleSheetsGateway gateway;
    @Autowired Schedule2AttendanceSheetWriter attendanceWriter;
    @SpyBean TrainerSheetPersistenceService persistence;
    @SpyBean Schedule2AttendanceCommand attendanceCommand;
    @SpyBean Schedule2AttendanceDelivery attendanceDelivery;
    GoogleSheetSpaceEntity space;
    UserEntity coach;
    GoogleSheetDataParser.PersonRow trainer;
    static final LocalDate FROM = LocalDate.of(2026, 9, 1), TO = LocalDate.of(2026, 9, 30);

    @BeforeEach void seed() {
        coach = user("coach", true, "+79990000001");
        user("ivan", false, "+79990000002");
        var ivan = profiles.findByUserId(users.findByPhone("+79990000002").orElseThrow().getId()).orElseThrow();
        ivan.setSurname("Иван"); ivan.setFirstName("Иванов");
        user("boxer", false, "+79990000003"); user("Гость", false, "+79990000004");
        space = new GoogleSheetSpaceEntity(); space.setActive(true); space.setDisplayName("test");
        space.setSpreadsheetId("test-spreadsheet"); space.setSpreadsheetUrl("https://example.invalid"); space.setCredentialsEnvVar("TEST");
        spaces.save(space);
        trainer = new GoogleSheetDataParser.PersonRow("coach", coach.getPhone(), false, "Coach's sheet", coach.getId().toString());
        em.flush(); TestTransaction.flagForCommit(); TestTransaction.end();
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenAnswer(call -> rows());
        when(gateway.readRows(any(), eq("'Тренеры'!A:Z"))).thenReturn(List.of(
                List.of("ФИО", "user_id", "Личный лист"), List.of("coach", coach.getId().toString(), "Coach's sheet")));
    }

    @AfterEach void cleanup() {
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            participants.deleteAllInBatch(); sessions.deleteAllInBatch(); profiles.deleteAllInBatch();
            users.deleteAllInBatch(); roles.deleteAllInBatch(); spaces.deleteAllInBatch();
        });
    }

    @Test void importsEveryDateAndAttendanceAndExposesExistingHttpEndpoints() throws Exception {
        var result = importer.importSheet(space.getId(), trainer);
        assertThat(result.counts()).isEqualTo(new TrainerSheetPersistenceService.Counts(3, 5, 0, 0));
        var list = schedule.list(coach.getId(), FROM, TO);
        assertThat(list).hasSize(3);
        var first = list.getFirst();
        assertThat(first.startTime()).isEqualTo(OffsetDateTime.parse("2026-09-22T00:00:00+03:00"));
        var detail = schedule.detail(coach.getId(), first.id());
        assertThat(detail.participants()).extracting(p -> p.attendanceStatus()).containsExactlyInAnyOrder(AttendanceStatus.PRESENT, AttendanceStatus.ABSENT);
        var mvc = MockMvcBuilders.standaloneSetup(new Schedule2Controller(schedule)).build();
        var auth = new UsernamePasswordAuthenticationToken(coach.getId().toString(), "unused");
        mvc.perform(get("/api/schedule2/trainings").principal(auth).param("from", FROM.toString()).param("to", TO.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(3));
        mvc.perform(get("/api/schedule2/trainings/" + first.id()).principal(auth))
                .andExpect(status().isOk()).andExpect(jsonPath("$.participants.length()").value(2));
        verify(gateway, never()).updateValues(any(), any());
    }

    @Test void repeatPreservesIdsAndUpdatesTitleDurationAttendanceWithoutDuplicates() {
        importer.importSheet(space.getId(), trainer);
        var before = schedule.list(coach.getId(), FROM, TO);
        var detail = schedule.detail(coach.getId(), before.getFirst().id());
        var changed = rows(); changed.get(4).set(3, "Обновлено"); changed.get(4).set(4, "110"); changed.get(17).set(7, "Нет");
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(changed);
        importer.importSheet(space.getId(), trainer);
        var after = schedule.list(coach.getId(), FROM, TO);
        assertThat(after).extracting(s -> s.id()).containsExactlyElementsOf(before.stream().map(s -> s.id()).toList());
        assertThat(after.getFirst().title()).isEqualTo("Обновлено");
        assertThat(after.getFirst().endTime()).isEqualTo(after.getFirst().startTime().plusMinutes(110));
        var updated = schedule.detail(coach.getId(), after.getFirst().id());
        assertThat(updated.participants()).extracting(p -> p.participationId())
                .containsExactlyInAnyOrderElementsOf(detail.participants().stream().map(p -> p.participationId()).toList());
        assertThat(updated.participants()).allMatch(p -> p.attendanceStatus() == AttendanceStatus.ABSENT);
        assertThat(sessions.count()).isEqualTo(3); assertThat(participants.count()).isEqualTo(5);
    }

    @Test void disabledOrMissingFlagLeavesExistingScheduleUntouchedEvenWithInvalidData() {
        importer.importSheet(space.getId(), trainer);
        for (var disabled : List.of(List.of(List.of("", "Синхронизация", "FALSE"), List.of("broken")), List.of(List.of("broken")))) {
            when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(disabled);
            assertThat(importer.importSheet(space.getId(), trainer).status()).isEqualTo("SKIPPED_SYNC_DISABLED");
            assertThat(schedule.list(coach.getId(), FROM, TO)).hasSize(3);
            assertThat(participants.count()).isEqualTo(5);
        }
    }

    @Test void removingStudentsAndTrainingsOnlyRetiresImportedRecordsAndSupportsRestoration() {
        importer.importSheet(space.getId(), trainer);
        var originalIds = schedule.list(coach.getId(), FROM, TO).stream().map(s -> s.id()).toList();
        var manual = schedule.create(coach.getId(), new com.round13.backend.module.schedule2.dto.Schedule2Dtos.CreateTrainingRequest(
                "Manual", TrainingType.PERSONAL, OffsetDateTime.parse("2026-09-23T10:00:00+03:00"), 60, null, null, List.of()));
        var changed = rows(); changed.set(19, List.of());
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(changed);
        assertThat(importer.importSheet(space.getId(), trainer).counts().removedParticipants()).isEqualTo(2);
        assertThat(participants.count()).isEqualTo(3);
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(rows().subList(0, 4));
        assertThat(importer.importSheet(space.getId(), trainer).counts().retiredSessions()).isEqualTo(3);
        assertThat(schedule.list(coach.getId(), FROM, TO)).extracting(s -> s.id()).containsExactly(manual.training().id());
        assertThatThrownBy(() -> schedule.detail(coach.getId(), originalIds.getFirst())).hasMessageContaining("404");
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(rows());
        importer.importSheet(space.getId(), trainer);
        assertThat(schedule.list(coach.getId(), FROM, TO)).extracting(s -> s.id()).containsAll(originalIds);
        assertThat(sessions.count()).isEqualTo(4);
    }

    @Test void unknownStudentRollsBackWholeTabAndOtherTrainerStillCommits() {
        importer.importSheet(space.getId(), trainer);
        UserEntity second = new TransactionTemplate(transactions).execute(status -> user("second", true, "+79990000005"));
        var bad = rows(); bad.get(4).set(3, "Must not persist"); bad.get(11).set(2, "Unknown student");
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(bad);
        when(gateway.readRows(any(), eq("'Second'"))).thenReturn(rows());
        when(gateway.readRows(any(), eq("'Тренеры'!A:Z"))).thenReturn(List.of(
                List.of("ФИО", "Телефон", "Личный лист", "user_id"),
                List.of("coach", coach.getPhone(), "Coach's sheet", coach.getId().toString()),
                List.of("second", second.getPhone(), "Second", second.getId().toString())));
        var result = sync.syncActive();
        assertThat(result.imports()).extracting(i -> i.status()).containsExactly("ERROR", "IMPORTED");
        assertThat(result.imports().getFirst().error()).contains("Тренировка ID 2", "строка ученика 12", "Unknown student");
        assertThat(schedule.list(coach.getId(), FROM, TO)).noneMatch(s -> s.title().equals("Must not persist"));
        assertThat(schedule.list(second.getId(), FROM, TO)).hasSize(3);
    }

    @Test void dateHeadersSurviveEmptyStudentTables() {
        var noStudents = rows(); noStudents.set(11, List.of()); noStudents.set(17, List.of()); noStudents.set(19, List.of());
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(noStudents);
        var result = importer.importSheet(space.getId(), trainer);
        assertThat(result.counts().sessions()).isEqualTo(3);
        assertThat(result.counts().participants()).isZero();
    }

    @Test void overlappingImportsSerializeAndCreateOneSetOfRecords() throws Exception {
        try (var pool = Executors.newFixedThreadPool(2)) {
            var start = new CountDownLatch(1);
            Callable<TrainerSheetImportService.Result> call = () -> { start.await(); return importer.importSheet(space.getId(), trainer); };
            var one = pool.submit(call); var two = pool.submit(call); start.countDown();
            assertThat(one.get(15, TimeUnit.SECONDS).status()).isEqualTo("IMPORTED");
            assertThat(two.get(15, TimeUnit.SECONDS).status()).isEqualTo("IMPORTED");
        }
        assertThat(sessions.count()).isEqualTo(3); assertThat(participants.count()).isEqualTo(5);
    }

    @Test void lateFailureAfterPersistenceRollsBackDatabaseChanges() {
        importer.importSheet(space.getId(), trainer);
        var changed = rows(); changed.get(4).set(3, "Must roll back");
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(changed);
        doAnswer(call -> { call.callRealMethod(); throw new IllegalStateException("after persistence"); })
                .when(org.springframework.test.util.AopTestUtils.<TrainerSheetPersistenceService>getUltimateTargetObject(persistence))
                .apply(anyString(), any(), any());
        assertThatThrownBy(() -> importer.importSheet(space.getId(), trainer)).hasMessageContaining("after persistence");
        assertThat(schedule.list(coach.getId(), FROM, TO)).noneMatch(s -> s.title().equals("Must roll back"));
        assertThat(sessions.count()).isEqualTo(3); assertThat(participants.count()).isEqualTo(5);
    }

    @ParameterizedTest @ValueSource(ints = {1, 100})
    void identityResolutionDoesNotFetchOneUserOrProfilePerStudent(int size) {
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            for (int i = 0; i < size; i++) user("batch" + i, false, String.format("+7888%07d", i));
        });
        var batch = rows();
        for (int i = 0; i < size; i++) batch.add(List.of("", Integer.toString(i + 3), "batch" + i, "", "FALSE", "TRUE"));
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(batch);
        var statistics = em.getEntityManagerFactory().unwrap(SessionFactory.class).getStatistics();
        statistics.clear();
        importer.importSheet(space.getId(), trainer);
        assertThat(statistics.getEntityFetchCount()).isZero();
        // Space lock + all active users + one profile batch + source sessions + source participants.
        assertThat(statistics.getQueryExecutionCount()).isEqualTo(5);
        assertThat(participants.count()).isEqualTo(5 + 2L * size);
    }

    @Test void ambiguousStudentAndMissingTrainerDoNotRetireExistingSchedule() {
        importer.importSheet(space.getId(), trainer);
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            var duplicate = user("differentNickname", false, "+79990000999");
            profiles.findByUserId(duplicate.getId()).orElseThrow().setFullName("Гость");
        });
        assertThatThrownBy(() -> importer.importSheet(space.getId(), trainer)).hasMessageContaining("Неоднозначный", "строка ученика 12");
        var missing = new GoogleSheetDataParser.PersonRow("missing", coach.getPhone(), false, "Coach's sheet", UUID.randomUUID().toString());
        assertThatThrownBy(() -> importer.importSheet(space.getId(), missing)).hasMessageContaining("тренер не найден");
        assertThat(schedule.list(coach.getId(), FROM, TO)).hasSize(3);
    }

    @Test void paymentIsDateSpecificUpdatedIdempotentlyAndNeverReturnedByScheduleHttp() throws Exception {
        importer.importSheet(space.getId(), trainer);
        var summaries = schedule.list(coach.getId(), FROM, TO);
        var timed = summaries.stream().filter(t -> t.startTime().getHour() == 18).findFirst().orElseThrow();
        var paid = participants.findSchedule2Participants(timed.id());
        assertThat(paid).filteredOn(p -> p.getUser().getNickname().equals("ivan"))
                .singleElement().satisfies(p -> assertThat(p.isSheetImportPaid()).isTrue());
        assertThat(participants.findSchedule2Participants(summaries.getFirst().id())).noneMatch(TrainingParticipantEntity::isSheetImportPaid);
        var ids = paid.stream().map(TrainingParticipantEntity::getId).toList();
        var changed = rows(); changed.get(17).set(4, ""); changed.get(19).set(4, "Да");
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(changed);
        importer.importSheet(space.getId(), trainer);
        var updated = participants.findSchedule2Participants(timed.id());
        assertThat(updated).extracting(TrainingParticipantEntity::getId).containsExactlyElementsOf(ids);
        assertThat(updated).filteredOn(p -> p.getUser().getNickname().equals("ivan"))
                .singleElement().satisfies(p -> assertThat(p.isSheetImportPaid()).isFalse());
        assertThat(updated).filteredOn(p -> p.getUser().getNickname().equals("boxer"))
                .singleElement().satisfies(p -> assertThat(p.isSheetImportPaid()).isTrue());
        assertThat(participants.count()).isEqualTo(5);
        var mvc = MockMvcBuilders.standaloneSetup(new Schedule2Controller(schedule)).build();
        mvc.perform(get("/api/schedule2/trainings/" + timed.id()).principal(auth()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.participants[0].sheetImportPaid").doesNotExist())
                .andExpect(jsonPath("$.participants[0].paid").doesNotExist());
    }

    @Test void httpAttendanceCommitsAndUpdatesCellsWithoutChangingPayment() throws Exception {
        importer.importSheet(space.getId(), trainer);
        var training = schedule.list(coach.getId(), FROM, TO).stream().filter(t -> t.startTime().getHour() == 18).findFirst().orElseThrow();
        putAttendance(training.id(), AttendanceStatus.PRESENT);
        assertThat(participants.findSchedule2Participants(training.id())).allMatch(p -> p.getAttendanceStatus() == AttendanceStatus.PRESENT);
        assertThat(participants.findSchedule2Participants(training.id())).filteredOn(p -> p.getUser().getNickname().equals("ivan"))
                .singleElement().satisfies(p -> assertThat(p.isSheetImportPaid()).isTrue());
        verify(gateway).updateValues(argThat(s -> s.getId().equals(space.getId())), argThat(updates -> updates.size() == 2 && updates.stream()
                .allMatch(u -> Set.of("'Coach''s sheet'!F18", "'Coach''s sheet'!F20").contains(u.range()) && u.values().equals(List.of(List.of(true))))));
        putAttendance(training.id(), AttendanceStatus.ABSENT);
        assertThat(participants.findSchedule2Participants(training.id())).allMatch(p -> p.getAttendanceStatus() == AttendanceStatus.ABSENT && p.getAttendanceVersion() >= 2);
        verify(gateway, never()).appendRows(any(), any(), any());
        assertThat(participants.count()).isEqualTo(5);
    }

    @Test void httpSaveCommitsDespiteExternalFailureAndDisabledFlag() throws Exception {
        importer.importSheet(space.getId(), trainer);
        var id = schedule.list(coach.getId(), FROM, TO).getFirst().id();
        doThrow(new IllegalStateException("simulated external failure")).when(gateway).updateValues(any(), any());
        putAttendance(id, AttendanceStatus.PRESENT);
        assertThat(participants.findSchedule2Participants(id)).allMatch(p -> p.getAttendanceStatus() == AttendanceStatus.PRESENT);
        reset(gateway);
        when(gateway.readRows(any(), eq("'Тренеры'!A:Z"))).thenReturn(List.of(
                List.of("ФИО", "user_id", "Личный лист"), List.of("coach", coach.getId().toString(), "Coach's sheet")));
        var disabled = rows(); disabled.get(1).set(2, "FALSE");
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(disabled);
        putAttendance(id, AttendanceStatus.ABSENT);
        assertThat(participants.findSchedule2Participants(id)).allMatch(p -> p.getAttendanceStatus() == AttendanceStatus.ABSENT);
        verify(gateway).updateValues(any(), any());
        assertThat(importer.importSheet(space.getId(), trainer).status()).isEqualTo("SKIPPED_SYNC_DISABLED");
        assertThat(participants.findSchedule2Participants(id)).allMatch(p -> p.getAttendanceStatus() == AttendanceStatus.ABSENT);
    }

    @Test void manualAttendanceCommitsWithoutPersonalSheetWriteback() throws Exception {
        var student = users.findByPhone("+79990000002").orElseThrow();
        var manual = schedule.create(coach.getId(), new com.round13.backend.module.schedule2.dto.Schedule2Dtos.CreateTrainingRequest(
                "Manual", TrainingType.PERSONAL, OffsetDateTime.parse("2026-09-23T10:00:00+03:00"), 60, null, null, List.of(student.getId())));
        putAttendance(manual.training().id(), AttendanceStatus.PRESENT);
        assertThat(participants.findSchedule2Participants(manual.training().id())).singleElement()
                .satisfies(p -> { assertThat(p.getAttendanceStatus()).isEqualTo(AttendanceStatus.PRESENT); assertThat(p.isSheetImportPaid()).isFalse(); });
        verifyNoInteractions(gateway);
    }

    @ParameterizedTest @ValueSource(ints = {1, 100})
    void writebackUsesBoundedIdentityQueriesAndOneGoogleBatch(int size) {
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            for (int i = 0; i < size; i++) user("write" + i, false, String.format("+7887%07d", i));
        });
        var batch = rows();
        for (int i = 0; i < size; i++) batch.add(List.of("", Integer.toString(i + 3), "write" + i, "", "FALSE", "TRUE"));
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(batch);
        importer.importSheet(space.getId(), trainer);
        var id = schedule.list(coach.getId(), FROM, TO).getFirst().id();
        var statistics = em.getEntityManagerFactory().unwrap(SessionFactory.class).getStatistics(); statistics.clear();
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            spaces.findActiveForUpdate();
            attendanceWriter.sync(sessions.findSchedule2ById(id).orElseThrow(), participants.findSchedule2Participants(id), coach.getId());
        });
        assertThat(statistics.getEntityFetchCount()).isZero();
        assertThat(statistics.getQueryExecutionCount()).isEqualTo(6);
        verify(gateway).updateValues(any(), argThat(updates -> updates.size() == size + 2));
    }

    @Test void concurrentAttendanceConfirmationsSerializeAndRejectStaleVersion() throws Exception {
        importer.importSheet(space.getId(), trainer);
        var id = schedule.list(coach.getId(), FROM, TO).getFirst().id();
        var request = new com.round13.backend.module.schedule2.dto.Schedule2Dtos.AttendanceRequest(schedule.detail(coach.getId(), id).participants().stream()
                .map(p -> new com.round13.backend.module.schedule2.dto.Schedule2Dtos.AttendanceItem(p.participationId(), AttendanceStatus.PRESENT, null, p.version())).toList());
        try (var pool = Executors.newFixedThreadPool(2)) {
            var start = new CountDownLatch(1);
            Callable<Integer> call = () -> {
                start.await();
                try { schedule.applyAttendance(coach.getId(), id, request); return 200; }
                catch (org.springframework.web.server.ResponseStatusException ex) { return ex.getStatusCode().value(); }
            };
            var one = pool.submit(call); var two = pool.submit(call); start.countDown();
            assertThat(List.of(one.get(15, TimeUnit.SECONDS), two.get(15, TimeUnit.SECONDS))).containsExactlyInAnyOrder(200, 409);
        }
        verify(gateway, times(1)).updateValues(any(), any());
        assertThat(participants.findSchedule2Participants(id)).allMatch(p -> p.getAttendanceStatus() == AttendanceStatus.PRESENT);
    }

    @Test void newTrainingAndRetryStayNewWithoutExternalDelivery() throws Exception {
        importer.importSheet(space.getId(), trainer);
        var id = schedule.list(coach.getId(), FROM, TO).getFirst().id();
        clearInvocations(gateway);
        retry(id, coach.getId()).andExpect(status().isOk())
                .andExpect(jsonPath("$.training.attendanceSheetSyncStatus").value("NEW"))
                .andExpect(jsonPath("$.training.attendanceSheetSyncAttemptedAt").isEmpty());
        verifyNoInteractions(gateway);
    }

    @Test void deliveryObservesCommittedAttendanceFromIndependentConnection() throws Exception {
        importer.importSheet(space.getId(), trainer);
        var id = schedule.list(coach.getId(), FROM, TO).getFirst().id();
        doAnswer(call -> {
            try (var pool = Executors.newSingleThreadExecutor()) {
                pool.submit(() -> {
                    var committed = schedule.detail(coach.getId(), id);
                    assertThat(committed.training().attendanceSheetSyncStatus()).isEqualTo(AttendanceSheetSyncStatus.NOT_SYNCED);
                    assertThat(committed.participants()).allMatch(p -> p.attendanceStatus() == AttendanceStatus.PRESENT);
                }).get(5, TimeUnit.SECONDS);
            }
            return null;
        }).when(gateway).updateValues(any(), any());
        putAttendance(id, AttendanceStatus.PRESENT);
        var state = schedule.detail(coach.getId(), id).training();
        assertThat(state.attendanceSheetSyncStatus()).isEqualTo(AttendanceSheetSyncStatus.SYNCED);
        assertThat(state.attendanceSheetSyncAttemptedAt()).isNotNull();
        assertThat(state.attendanceSheetSyncedAt()).isAfterOrEqualTo(state.attendanceSheetSyncAttemptedAt());
    }

    @Test void failedDeliveryRetainsDbAndRetrySendsDbWithDisabledFlagIdempotently() throws Exception {
        importer.importSheet(space.getId(), trainer);
        var id = schedule.list(coach.getId(), FROM, TO).stream().filter(t -> t.startTime().getHour() == 18).findFirst().orElseThrow().id();
        doThrow(new IllegalStateException("Google unavailable")).when(gateway).updateValues(any(), any());
        putAttendance(id, AttendanceStatus.PRESENT);
        var before = schedule.detail(coach.getId(), id);
        assertThat(before.training().attendanceSheetSyncStatus()).isEqualTo(AttendanceSheetSyncStatus.NOT_SYNCED);
        assertThat(before.training().attendanceSheetSyncAttemptedAt()).isNotNull();
        assertThat(before.training().attendanceSheetSyncedAt()).isNull();
        retry(id, coach.getId()).andExpect(status().isOk())
                .andExpect(jsonPath("$.training.attendanceSheetSyncStatus").value("NOT_SYNCED"));
        var disabled = rows(); disabled.get(1).set(2, "FALSE");
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(disabled);
        doNothing().when(gateway).updateValues(any(), any()); clearInvocations(gateway);
        retry(id, coach.getId()).andExpect(status().isOk())
                .andExpect(jsonPath("$.training.attendanceSheetSyncStatus").value("SYNCED"));
        retry(id, coach.getId()).andExpect(status().isOk())
                .andExpect(jsonPath("$.training.attendanceSheetSyncStatus").value("SYNCED"));
        verify(gateway, times(1)).updateValues(any(), argThat(updates -> updates.size() == 2
                && updates.stream().allMatch(u -> u.values().equals(List.of(List.of(true)))
                && Set.of("'Coach''s sheet'!F18", "'Coach''s sheet'!F20").contains(u.range()))));
        verify(gateway, never()).appendRows(any(), any(), any());
        verify(gateway, never()).replaceRows(any(), any(), any());
        assertThat(schedule.detail(coach.getId(), id).participants()).isEqualTo(before.participants());
        assertThat(participants.count()).isEqualTo(5);
        assertThat(participants.findSchedule2Participants(id)).filteredOn(p -> p.getUser().getNickname().equals("ivan"))
                .singleElement().satisfies(p -> assertThat(p.isSheetImportPaid()).isTrue());
    }

    @ParameterizedTest @ValueSource(booleans = {false, true})
    void importPreservesConfirmedAttendanceAndDeliveryStatusWhileUpdatingPayment(boolean delivered) throws Exception {
        importer.importSheet(space.getId(), trainer);
        var id = schedule.list(coach.getId(), FROM, TO).stream().filter(t -> t.startTime().getHour() == 18).findFirst().orElseThrow().id();
        if (!delivered) doThrow(new IllegalStateException("Google unavailable")).when(gateway).updateValues(any(), any());
        putAttendance(id, AttendanceStatus.PRESENT);
        var before = schedule.detail(coach.getId(), id);
        var stale = rows(); stale.get(17).set(5, "FALSE"); stale.get(19).set(5, "FALSE"); stale.get(17).set(4, "FALSE");
        when(gateway.readRows(any(), eq("'Coach''s sheet'"))).thenReturn(stale);
        importer.importSheet(space.getId(), trainer);
        var after = schedule.detail(coach.getId(), id);
        assertThat(after.training().attendanceSheetSyncStatus()).isEqualTo(delivered ? AttendanceSheetSyncStatus.SYNCED : AttendanceSheetSyncStatus.NOT_SYNCED);
        assertThat(after.participants()).isEqualTo(before.participants());
        assertThat(participants.findSchedule2Participants(id)).noneMatch(TrainingParticipantEntity::isSheetImportPaid);
        // A removed source row must not physically discard confirmed attendance while pending delivery.
        stale.set(19, List.of());
        importer.importSheet(space.getId(), trainer);
        assertThat(schedule.detail(coach.getId(), id).participants()).isEqualTo(before.participants());
    }

    @Test void retryRejectsWrongOwnerAndMissingTrainingWithoutDelivery() throws Exception {
        importer.importSheet(space.getId(), trainer);
        var id = schedule.list(coach.getId(), FROM, TO).getFirst().id();
        clearInvocations(gateway);
        retry(id, UUID.randomUUID()).andExpect(status().isForbidden());
        retry(UUID.randomUUID(), coach.getId()).andExpect(status().isNotFound());
        verifyNoInteractions(gateway);
    }

    @Test void invalidAttendanceRollsBackWholeBatchAndNeverDelivers() throws Exception {
        importer.importSheet(space.getId(), trainer);
        var id = schedule.list(coach.getId(), FROM, TO).getFirst().id();
        var before = schedule.detail(coach.getId(), id);
        var items = new ArrayList<com.round13.backend.module.schedule2.dto.Schedule2Dtos.AttendanceItem>();
        for (var p : before.participants()) items.add(new com.round13.backend.module.schedule2.dto.Schedule2Dtos.AttendanceItem(
                p.participationId(), AttendanceStatus.PRESENT, null, p.version()));
        var last = items.getLast(); items.set(items.size()-1, new com.round13.backend.module.schedule2.dto.Schedule2Dtos.AttendanceItem(
                last.participationId(), last.status(), null, last.version()+10));
        clearInvocations(gateway);
        assertThatThrownBy(() -> schedule.applyAttendance(coach.getId(), id,
                new com.round13.backend.module.schedule2.dto.Schedule2Dtos.AttendanceRequest(items))).hasMessageContaining("409");
        assertThat(schedule.detail(coach.getId(), id)).isEqualTo(before);
        verifyNoInteractions(gateway);
    }

    @Test void dbCommitFailureRollsBackConfirmationAndNeverCallsGoogle() {
        importer.importSheet(space.getId(), trainer);
        var id = schedule.list(coach.getId(), FROM, TO).getFirst().id();
        var before = schedule.detail(coach.getId(), id);
        doAnswer(call -> {
            call.callRealMethod();
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                    new org.springframework.transaction.support.TransactionSynchronization() {
                        @Override public void beforeCommit(boolean readOnly) { throw new IllegalStateException("injected commit failure"); }
                    });
            return null;
        }).when(org.springframework.test.util.AopTestUtils.<Schedule2AttendanceCommand>getUltimateTargetObject(attendanceCommand))
                .save(any(), any(), any());
        clearInvocations(gateway);
        var request = new com.round13.backend.module.schedule2.dto.Schedule2Dtos.AttendanceRequest(before.participants().stream()
                .map(p -> new com.round13.backend.module.schedule2.dto.Schedule2Dtos.AttendanceItem(p.participationId(), AttendanceStatus.PRESENT, null, p.version())).toList());
        assertThatThrownBy(() -> schedule.applyAttendance(coach.getId(), id, request)).hasMessage("injected commit failure");
        assertThat(schedule.detail(coach.getId(), id)).isEqualTo(before);
        verifyNoInteractions(gateway);
    }

    @Test void failedStatusCommitAfterGoogleRetainsPendingAndRetryRecovers() throws Exception {
        importer.importSheet(space.getId(), trainer);
        var id = schedule.list(coach.getId(), FROM, TO).getFirst().id();
        var target = org.springframework.test.util.AopTestUtils.<Schedule2AttendanceDelivery>getUltimateTargetObject(attendanceDelivery);
        doAnswer(call -> {
            call.callRealMethod();
            throw new IllegalStateException("status transaction failed after Google accepted write");
        }).when(target).deliver(any(), any());
        putAttendance(id, AttendanceStatus.PRESENT);
        assertThat(schedule.detail(coach.getId(), id).training().attendanceSheetSyncStatus()).isEqualTo(AttendanceSheetSyncStatus.NOT_SYNCED);
        assertThat(participants.findSchedule2Participants(id)).allMatch(p -> p.getAttendanceStatus() == AttendanceStatus.PRESENT);
        doCallRealMethod().when(target).deliver(any(), any());
        retry(id, coach.getId()).andExpect(status().isOk())
                .andExpect(jsonPath("$.training.attendanceSheetSyncStatus").value("SYNCED"));
        verify(gateway, times(2)).updateValues(any(), any());
        verify(gateway, never()).appendRows(any(), any(), any());
    }

    @Test void overlappingRetriesSerializeAndDeliverOnlyOnce() throws Exception {
        importer.importSheet(space.getId(), trainer);
        var id = schedule.list(coach.getId(), FROM, TO).getFirst().id();
        doThrow(new IllegalStateException("Google unavailable")).when(gateway).updateValues(any(), any());
        putAttendance(id, AttendanceStatus.PRESENT);
        doNothing().when(gateway).updateValues(any(), any()); clearInvocations(gateway);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var start = new CountDownLatch(1);
            Callable<AttendanceSheetSyncStatus> call = () -> { start.await(); return schedule.syncAttendance(coach.getId(), id).training().attendanceSheetSyncStatus(); };
            var one = pool.submit(call); var two = pool.submit(call); start.countDown();
            assertThat(one.get(15, TimeUnit.SECONDS)).isEqualTo(AttendanceSheetSyncStatus.SYNCED);
            assertThat(two.get(15, TimeUnit.SECONDS)).isEqualTo(AttendanceSheetSyncStatus.SYNCED);
        }
        verify(gateway, times(1)).updateValues(any(), any());
    }

    private org.springframework.test.web.servlet.ResultActions retry(UUID id, UUID trainerId) throws Exception {
        return MockMvcBuilders.standaloneSetup(new Schedule2Controller(schedule)).build().perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/schedule2/trainings/" + id + "/attendance/sync-to-sheets")
                .principal(new UsernamePasswordAuthenticationToken(trainerId.toString(), "unused")));
    }

    private UsernamePasswordAuthenticationToken auth() {
        return new UsernamePasswordAuthenticationToken(coach.getId().toString(), "unused");
    }

    private void putAttendance(UUID id, AttendanceStatus status) throws Exception {
        var detail = schedule.detail(coach.getId(), id);
        var payload = new com.round13.backend.module.schedule2.dto.Schedule2Dtos.AttendanceRequest(detail.participants().stream()
                .map(p -> new com.round13.backend.module.schedule2.dto.Schedule2Dtos.AttendanceItem(p.participationId(), status, null, p.version())).toList());
        var mvc = MockMvcBuilders.standaloneSetup(new Schedule2Controller(schedule)).build();
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/schedule2/trainings/" + id + "/attendance")
                .principal(auth()).contentType("application/json").content(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(payload)))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk());
    }

    UserEntity user(String name, boolean trainerFlag, String phone) {
        var role = roles.findByCode("ATHLETE").orElseGet(() -> { var r = new RoleEntity(); r.setCode("ATHLETE"); return roles.save(r); });
        var user = new UserEntity(); user.setNickname(name); user.setRole(role); user.setStatus(UserStatus.ACTIVE);
        user.setPhone(phone); user.setTrainer(trainerFlag); users.save(user);
        var profile = new ProfileEntity(); profile.setUser(user); profile.setFullName(name); profiles.save(profile);
        return user;
    }
    static List<List<String>> rows() {
        List<List<String>> result = new ArrayList<>();
        TrainerSheetParserTest.example().forEach(row -> result.add(new ArrayList<>(row)));
        result.get(1).set(2, "TRUE"); return result;
    }
}
