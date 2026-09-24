package com.round13.backend.module.stats.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.members.mapper.TrainerStudentCardMapper;
import com.round13.backend.module.members.repo.TrainerStudentActivityRepository;
import com.round13.backend.module.stats.repo.TrainingAttendanceStatsRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;

import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(showSql = false, properties = {"spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop"})
class TrainingAttendanceReadIntegrationTest {
    @Autowired EntityManager em;
    @Autowired TrainingAttendanceStatsRepository stats;
    @Autowired TrainerStudentActivityRepository activities;
    private final OffsetDateTime now = OffsetDateTime.parse("2026-09-24T12:00:00Z");
    private UserEntity student;
    private UserEntity trainer;

    @BeforeEach void users() {
        var role = new RoleEntity(); role.setCode("ATHLETE"); em.persist(role);
        student = user("student", role); trainer = user("trainer", role);
    }

    @Test void countsOnlyCompletedActiveSchedule2SessionsAndUsesAttendance() {
        participation("present", now.minusHours(2), AttendanceStatus.PRESENT, true, true);
        participation("absent", now.minusHours(2), AttendanceStatus.ABSENT, true, true);
        participation("just-ended", now.minusHours(1), AttendanceStatus.ABSENT, true, true);
        participation("in-progress", now.minusMinutes(30), AttendanceStatus.ABSENT, true, true);
        participation("future", now.plusDays(1), AttendanceStatus.ABSENT, true, true);
        participation("retired", now.minusDays(1), AttendanceStatus.PRESENT, true, false);
        participation("legacy", now.minusDays(1), AttendanceStatus.ABSENT, false, true);
        em.flush(); em.clear();
        assertThat(stats.countCompleted(student.getId(), AttendanceStatus.PRESENT, now)).isEqualTo(1);
        assertThat(stats.countCompleted(student.getId(), AttendanceStatus.ABSENT, now)).isEqualTo(2);
        assertThat(stats.countCompleted(trainer.getId(), AttendanceStatus.PRESENT, now)).isZero();
    }

    @Test void cardAndHistoryIgnoreRetiredSessionsAndExposeCurrentAttendance() {
        var present = participation("present", now.minusDays(2), AttendanceStatus.PRESENT, true, true);
        participation("absent", now.minusDays(1), AttendanceStatus.ABSENT, true, true);
        participation("next", now.plusHours(1), AttendanceStatus.ABSENT, true, true);
        participation("later", now.plusDays(2), AttendanceStatus.ABSENT, true, true);
        participation("retired-next", now.plusMinutes(10), AttendanceStatus.ABSENT, true, false);
        participation("retired-present", now.minusHours(2), AttendanceStatus.PRESENT, true, false);
        participation("legacy-present", now.minusHours(1), AttendanceStatus.PRESENT, false, true);
        em.flush(); em.clear();
        var one = PageRequest.of(0, 1);
        assertThat(activities.findNext(student.getId(), trainer.getId(), now, one))
                .extracting(p -> p.getSession().getTitle()).containsExactly("next");
        assertThat(activities.findLastAttended(student.getId(), trainer.getId(), now, one))
                .extracting(TrainingParticipantEntity::getId).containsExactly(present.getId());
        assertThat(activities.findRecent(student.getId(), trainer.getId(), now, PageRequest.of(0, 3)))
                .extracting(p -> p.getSession().getTitle()).containsExactly("absent", "present");
        assertThat(activities.findHistory(student.getId(), trainer.getId()))
                .extracting(p -> p.getSession().getTitle()).containsExactly("later", "next", "absent", "present");
        assertThat(activities.findHistory(trainer.getId(), student.getId())).isEmpty();
        var item = Mappers.getMapper(TrainerStudentCardMapper.class).toTrainingItem(present);
        assertThat(item.getAttendanceStatus()).isEqualTo("PRESENT");
    }

    private UserEntity user(String name, RoleEntity role) {
        var user = new UserEntity(); user.setNickname(name); user.setRole(role); user.setStatus(UserStatus.ACTIVE); em.persist(user); return user;
    }

    private TrainingParticipantEntity participation(String title, OffsetDateTime start, AttendanceStatus attendance,
                                                    boolean enabled, boolean active) {
        var session = new TrainingSessionEntity(); session.setTitle(title); session.setType(TrainingType.GROUP);
        session.setStartTime(start); session.setDurationMinutes(60); session.setCoach(trainer);
        session.setSchedule2Enabled(enabled); session.setSheetImportActive(active); em.persist(session);
        var participant = new TrainingParticipantEntity(); participant.setSession(session); participant.setUser(student);
        participant.setAttendanceStatus(attendance); em.persist(participant); return participant;
    }
}
