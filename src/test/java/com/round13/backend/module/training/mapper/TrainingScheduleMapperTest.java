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
    void trainerScheduleIncludesSessionTitleAndLocation() {
        TrainingSessionEntity session = session("Групповая выносливость", "Большой ринг");
        TrainingParticipantEntity participant = participant(session, user("student_two"));

        TrainerScheduleItemResponse response = trainerScheduleMapper.map(session, participant);

        assertThat(response.getTitle()).isEqualTo("Групповая выносливость");
        assertThat(response.getLocation()).isEqualTo("Большой ринг");
        assertThat(response.getStudentName()).isEqualTo("student_two");
    }

    private TrainingSessionEntity session(String title, String location) {
        TrainingSessionEntity session = new TrainingSessionEntity();
        session.setId(UUID.randomUUID());
        session.setTitle(title);
        session.setType(TrainingType.PERSONAL);
        session.setStartTime(OffsetDateTime.parse("2026-05-18T12:00:00+03:00"));
        session.setDurationMinutes(60);
        session.setLocation(location);
        return session;
    }

    private TrainingParticipantEntity participant(TrainingSessionEntity session, UserEntity user) {
        TrainingParticipantEntity participant = new TrainingParticipantEntity();
        participant.setId(UUID.randomUUID());
        participant.setSession(session);
        participant.setUser(user);
        participant.setStatus(TrainingParticipantStatus.BOOKED);
        return participant;
    }

    private UserEntity user(String nickname) {
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setNickname(nickname);
        return user;
    }
}
