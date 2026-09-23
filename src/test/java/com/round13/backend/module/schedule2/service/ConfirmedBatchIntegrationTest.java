package com.round13.backend.module.schedule2.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.info.repo.TrainingSessionRepository;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.schedule2.dto.Schedule2Dtos.*;
import com.round13.backend.module.training.repo.TrainingParticipantRepository;
import com.round13.backend.module.user.repo.*;
import com.round13.backend.module.verification.dto.VerificationDtos.*;
import com.round13.backend.module.verification.repo.StudentVerificationRequestRepository;
import com.round13.backend.module.verification.service.StudentVerificationService;
import jakarta.persistence.EntityManager;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.*;
import static org.assertj.core.api.Assertions.*;

@DataJpaTest(showSql = false, properties = {"spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.generate_statistics=true", "logging.level.org.hibernate.stat=OFF",
        "logging.level.org.hibernate.engine.internal.StatisticalLoggingSessionEventListener=OFF"})
@Import({Schedule2Service.class, Schedule2QueryService.class, Schedule2AttendanceCommand.class,
        Schedule2TrainingAccess.class, StudentVerificationService.class})
class ConfirmedBatchIntegrationTest {
    @Autowired EntityManager em;
    @Autowired UserRepository users;
    @Autowired RoleRepository roles;
    @Autowired ProfileRepository profiles;
    @Autowired TrainingSessionRepository sessions;
    @Autowired TrainingParticipantRepository participants;
    @Autowired Schedule2Service schedule;
    @Autowired StudentVerificationService verification;
    @Autowired StudentVerificationRequestRepository requests;
    @Autowired JdbcTemplate jdbc;
    @MockBean Schedule2AttendanceDelivery attendanceDelivery;

    @ParameterizedTest @ValueSource(ints = {1, 10, 100})
    void coldScheduleListAndDetailUseThreeSelects(int size) {
        var coach = user("COACH"); UUID coachId = coach.getId();
        var students = new ArrayList<UserEntity>();
        for (int i = 0; i < size; i++) students.add(user("ATHLETE"));
        UUID detailId = null;
        for (int i = 0; i < size; i++) {
            var session = new TrainingSessionEntity(); session.setTitle("Batch"); session.setCoach(coach);
            session.setType(TrainingType.GROUP); session.setStartTime(OffsetDateTime.now()); session.setDurationMinutes(60);
            session.setSchedule2Enabled(true); sessions.save(session);
            if (i == 0) { detailId = session.getId(); for (var student : students) {
                var participant = new TrainingParticipantEntity(); participant.setSession(session); participant.setUser(student); participants.save(participant);
            } }
        }
        em.flush(); em.clear(); var statistics = em.getEntityManagerFactory().unwrap(SessionFactory.class).getStatistics(); statistics.clear();
        assertThat(schedule.list(coachId, LocalDate.now().minusDays(1), LocalDate.now().plusDays(1))).hasSize(size);
        assertThat(statistics.getPrepareStatementCount()).isEqualTo(3);
        em.clear(); statistics.clear();
        assertThat(schedule.detail(coachId, detailId).participants()).hasSize(size);
        assertThat(statistics.getPrepareStatementCount()).isEqualTo(3);
    }

    @Test void duplicateSubmissionUsesOneDatabaseRowAndRetainsBothSnapshots() {
        var student = user("ATHLETE"); var trainer = user("COACH"); em.flush(); em.clear();
        var result = verification.submit(student.getId(), new SubmitRequest(List.of(
                new Selection(trainer.getId(), Set.of("GROUP")), new Selection(trainer.getId(), Set.of("PERSONAL")))));
        em.flush(); em.clear();
        assertThat(result.getFirst().id()).isEqualTo(result.getLast().id()).isNotNull();
        assertThat(result.getFirst().createdAt()).isNotNull();
        assertThat(result.getFirst().trainingTypes()).containsExactly("GROUP");
        assertThat(result.getLast().trainingTypes()).containsExactly("PERSONAL");
        assertThat(requests.findByStudentIdOrderByCreatedAtDesc(student.getId())).singleElement()
                .satisfies(r -> assertThat(r.getTrainingTypes()).isEqualTo("PERSONAL"));
    }

    @Test void batchedTrainerOptionsPreserveCurrentDeletedUserFilters() {
        var visible = user("COACH");
        var deleted = user("COACH"); deleted.setStatus(UserStatus.DELETED);
        var permanentlyDeleted = user("COACH"); permanentlyDeleted.setPermanentlyDeleted(true);
        em.flush(); em.clear();

        assertThat(verification.trainers()).extracting(TrainerOption::id).containsExactly(visible.getId());
        assertThat(users.findUserProfileBundle(deleted.getId())).isEmpty();
        assertThat(users.findUserProfileBundle(permanentlyDeleted.getId())).isEmpty();
    }

    @Test void lateMissingStudentRollsBackCreation() {
        var coach = user("COACH"); var student = user("ATHLETE"); em.flush();
        assertThatThrownBy(() -> schedule.create(coach.getId(), new CreateTrainingRequest("rollback-marker", TrainingType.GROUP,
                OffsetDateTime.now(), 60, null, null, List.of(student.getId(), UUID.randomUUID()))))
                .isInstanceOf(ResponseStatusException.class);
        TestTransaction.end();
        assertThat(jdbc.queryForObject("select count(*) from training_sessions where title='rollback-marker'", Long.class)).isZero();
    }

    @Test void lateAttendanceConflictRollsBackEarlierParticipant() {
        var coach = user("COACH"); var first = user("ATHLETE"); var second = user("ATHLETE");
        var detail = schedule.create(coach.getId(), new CreateTrainingRequest("conflict", TrainingType.GROUP,
                OffsetDateTime.now(), 60, null, null, List.of(first.getId(), second.getId())));
        em.flush(); TestTransaction.flagForCommit(); TestTransaction.end();
        var one = detail.participants().getFirst(); var two = detail.participants().getLast();
        try {
            assertThatThrownBy(() -> schedule.applyAttendance(coach.getId(), detail.training().id(), new AttendanceRequest(List.of(
                    new AttendanceItem(one.participationId(), AttendanceStatus.PRESENT, "changed", one.version()),
                    new AttendanceItem(two.participationId(), AttendanceStatus.PRESENT, null, two.version() + 1)))))
                    .isInstanceOf(ResponseStatusException.class).hasMessageContaining("409");
            assertThat(jdbc.queryForObject("select attendance_version from training_participants where id=?", Long.class, one.participationId())).isZero();
            assertThat(jdbc.queryForObject("select attendance_status from training_participants where id=?", String.class, one.participationId())).isEqualTo("ABSENT");
        } finally {
            jdbc.update("delete from training_participants where session_id=?", detail.training().id());
            jdbc.update("delete from training_sessions where id=?", detail.training().id());
            for (var u : List.of(coach, first, second)) { jdbc.update("delete from profiles where user_id=?", u.getId()); jdbc.update("delete from users where id=?", u.getId()); }
        }
    }

    UserEntity user(String code) {
        var role = roles.findByCode(code).orElseGet(() -> { var r = new RoleEntity(); r.setCode(code); return roles.save(r); });
        var user = new UserEntity(); user.setRole(role); user.setStatus(UserStatus.ACTIVE); user.setNickname(UUID.randomUUID().toString()); user = users.save(user);
        var profile = new ProfileEntity(); profile.setUser(user); profile.setSurname("Last"); profile.setFirstName("First"); profiles.save(profile);
        return user;
    }
}
