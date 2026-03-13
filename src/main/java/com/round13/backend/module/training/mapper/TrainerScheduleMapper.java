package com.round13.backend.module.training.mapper;

import com.round13.backend.domain.TrainingParticipantStatus;
import com.round13.backend.domain.TrainingParticipantEntity;
import com.round13.backend.domain.TrainingSessionEntity;
import com.round13.backend.module.training.dto.TrainerScheduleItemResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.time.OffsetDateTime;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface TrainerScheduleMapper {

    @Mapping(target = "sessionId", source = "session.id")
    @Mapping(target = "studentId", source = "participant.user.id")
    @Mapping(target = "studentName", source = "participant.user.nickname")
    @Mapping(target = "startsAt", source = "session.startTime")
    @Mapping(target = "endsAt", expression = "java(calculateEnd(session))")
    @Mapping(target = "status", expression = "java(participant.getStatus() == null ? null : participant.getStatus().name())")
    @Mapping(target = "canConfirmCancellation", expression = "java(canConfirmCancellation(participant, session))")
    @Mapping(target = "canMarkAttended", expression = "java(canMarkAttended(participant, session))")
    @Mapping(target = "canCancel", expression = "java(canCancel(session))")
    TrainerScheduleItemResponse map(
            TrainingSessionEntity session,
            TrainingParticipantEntity participant
    );

    default OffsetDateTime calculateEnd(TrainingSessionEntity session) {
        if (session.getStartTime() == null) {
            return null;
        }
        return session.getStartTime().plusMinutes(session.getDurationMinutes());
    }

    default boolean canCancel(TrainingSessionEntity session) {
        if (session.getStartTime() == null) {
            return false;
        }
        return session.getStartTime().isAfter(OffsetDateTime.now());
    }

    default boolean canConfirmCancellation(TrainingParticipantEntity participant, TrainingSessionEntity session) {
        if (participant == null || session == null || session.getStartTime() == null) {
            return false;
        }
        return TrainingParticipantStatus.CANCEL_REQUESTED.equals(participant.getStatus())
                && session.getStartTime().isAfter(OffsetDateTime.now());
    }

    default boolean canMarkAttended(TrainingParticipantEntity participant, TrainingSessionEntity session) {
        if (participant == null || session == null || session.getStartTime() == null) {
            return false;
        }
        return TrainingParticipantStatus.BOOKED.equals(participant.getStatus())
                && !session.getStartTime().isAfter(OffsetDateTime.now());
    }
}
