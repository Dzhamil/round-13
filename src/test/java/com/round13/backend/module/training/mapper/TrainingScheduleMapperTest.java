package com.round13.backend.module.training.mapper;

import com.round13.backend.domain.TrainingParticipantEntity;
import com.round13.backend.domain.TrainingParticipantStatus;
import com.round13.backend.domain.TrainingSessionEntity;
import com.round13.backend.domain.TrainingType;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.training.dto.MyScheduleItemResponse;
import com.round13.backend.module.training.dto.TrainerScheduleItemResponse;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class TrainingScheduleMapperTest {

    private final MyScheduleMapper myScheduleMapper = Mappers.getMapper(MyScheduleMapper.class);
    private final TrainerScheduleMapper trainerScheduleMapper = Mappers.getMapper(TrainerScheduleMapper.class);

    @Test
    void myScheduleIncludesSessionTitleAndLocation() {
        TrainingSessionEntity session = session("Персональная техника", "Зал Round 13");
        UserEntity coach = user("coach_ivan");
        session.setCoach(coach);
        TrainingParticipantEntity participant = participant(session, user("student_one"));

        MyScheduleItemResponse response = myScheduleMapper.toItem(
                participant,
                OffsetDateTime.parse("2026-05-17T09:00:00+03:00")
        );

        assertThat(response.getTitle()).isEqualTo("Персональная техника");
        assertThat(response.getLocation()).isEqualTo("Зал Round 13");
        assertThat(response.getCoachName()).isEqualTo("coach_ivan");
    }

    @Test
    void myScheduleMarksFutureBookedAsCancellable() {
        OffsetDateTime now = OffsetDateTime.parse("2026-05-19T09:00:00+03:00");
        TrainingSessionEntity session = session(
                "Групповая выносливость",
                "Зал Round 13",
                OffsetDateTime.parse("2026-05-20T14:00:00+03:00")
        );
        TrainingParticipantEntity participant = participant(
                session,
                user("student_one"),
                TrainingParticipantStatus.BOOKED
        );

        MyScheduleItemResponse response = myScheduleMapper.toItem(participant, now);

        assertThat(response.getStatus()).isEqualTo("BOOKED");
        assertThat(response.isCanCancel()).isTrue();
    }

    @Test
    void myScheduleKeepsPastAttendedVisibleButNotCancellable() {
        OffsetDateTime now = OffsetDateTime.parse("2026-05-19T20:00:00+03:00");
        TrainingSessionEntity session = session(
                "Персональная работа на лапах",
                "Зал Round 13",
                OffsetDateTime.parse("2026-05-19T12:00:00+03:00")
        );
        TrainingParticipantEntity participant = participant(
                session,
                user("student_one"),
                TrainingParticipantStatus.ATTENDED
        );

        MyScheduleItemResponse response = myScheduleMapper.toItem(participant, now);

        assertThat(response.getTitle()).isEqualTo("Персональная работа на лапах");
        assertThat(response.getLocation()).isEqualTo("Зал Round 13");
        assertThat(response.getStatus()).isEqualTo("ATTENDED");
        assertThat(response.isCanCancel()).isFalse();
    }

    @Test
    void trainerScheduleIncludesSessionTitleAndLocation() {
        TrainingSessionEntity session = session("Групповая выносливость", "Большой ринг");
        TrainingParticipantEntity participant = participant(session, user("student_two"));

        TrainerScheduleItemResponse response = trainerScheduleMapper.map(session, participant);

        assertThat(response.getTitle()).isEqualTo("Групповая выносливость");
        assertThat(response.getLocation()).isEqualTo("Большой ринг");
        assertThat(response.getStudentName()).isEqualTo("student_two");
    }

    @Test
    void trainerScheduleKeepsAttendedStatusWithoutActions() {
        TrainingSessionEntity session = session(
                "Персональная работа на лапах",
                "Зал Round 13",
                OffsetDateTime.now().minusHours(2)
        );
        TrainingParticipantEntity participant = participant(
                session,
                user("student_two"),
                TrainingParticipantStatus.ATTENDED
        );

        TrainerScheduleItemResponse response = trainerScheduleMapper.map(session, participant);

        assertThat(response.getStatus()).isEqualTo("ATTENDED");
        assertThat(response.isCanConfirmCancellation()).isFalse();
        assertThat(response.isCanMarkAttended()).isFalse();
        assertThat(response.isCanMarkNoShow()).isFalse();
        assertThat(response.isCanCancelByTrainer()).isFalse();
    }

    private TrainingSessionEntity session(String title, String location) {
        return session(title, location, OffsetDateTime.parse("2026-05-18T12:00:00+03:00"));
    }

    private TrainingSessionEntity session(String title, String location, OffsetDateTime startsAt) {
        TrainingSessionEntity session = new TrainingSessionEntity();
        session.setId(UUID.randomUUID());
        session.setTitle(title);
        session.setType(TrainingType.PERSONAL);
        session.setStartTime(startsAt);
        session.setDurationMinutes(60);
        session.setLocation(location);
        return session;
    }

    private TrainingParticipantEntity participant(TrainingSessionEntity session, UserEntity user) {
        return participant(session, user, TrainingParticipantStatus.BOOKED);
    }

    private TrainingParticipantEntity participant(
            TrainingSessionEntity session,
            UserEntity user,
            TrainingParticipantStatus status
    ) {
        TrainingParticipantEntity participant = new TrainingParticipantEntity();
        participant.setId(UUID.randomUUID());
        participant.setSession(session);
        participant.setUser(user);
        participant.setStatus(status);
        return participant;
    }

    private UserEntity user(String nickname) {
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setNickname(nickname);
        return user;
    }
}
