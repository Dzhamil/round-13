package com.round13.backend.module.training.mapper;

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
    @Mapping(target = "endsAt", expression = "java(session.getEndTime())")
    @Mapping(target = "status", expression = "java(participant == null || participant.getStatus() == null ? null : participant.getStatus().name())")
    @Mapping(target = "canConfirmCancellation", expression = "java(canConfirmCancellation(participant, session))")
    @Mapping(target = "canMarkAttended", expression = "java(canMarkAttended(participant, session))")
    @Mapping(target = "canMarkNoShow", expression = "java(canMarkNoShow(participant, session))")
    @Mapping(target = "canCancelByTrainer", expression = "java(canCancelByTrainer(participant, session))")
    TrainerScheduleItemResponse map(
            TrainingSessionEntity session,
            TrainingParticipantEntity participant
    );

    default boolean canConfirmCancellation(TrainingParticipantEntity participant, TrainingSessionEntity session) {
        if (participant == null || session == null || session.getStartTime() == null) {
            return false;
        }
        return participant.getStatus() != null
                && participant.getStatus().isCancellationRequested()
                && session.getStartTime().isAfter(OffsetDateTime.now());
    }

    default boolean canMarkAttended(TrainingParticipantEntity participant, TrainingSessionEntity session) {
        if (participant == null || session == null || session.getStartTime() == null) {
            return false;
        }
        return participant.getStatus() != null
                && participant.getStatus().isBooked()
                && !session.getStartTime().isAfter(OffsetDateTime.now());
    }

    default boolean canMarkNoShow(TrainingParticipantEntity participant, TrainingSessionEntity session) {
        if (participant == null || session == null || session.getStartTime() == null) {
            return false;
        }
        return participant.getStatus() != null
                && participant.getStatus().isBooked()
                && !session.getStartTime().isAfter(OffsetDateTime.now());
    }

    default boolean canCancelByTrainer(TrainingParticipantEntity participant, TrainingSessionEntity session) {
        if (participant == null || session == null || session.getStartTime() == null) {
            return false;
        }
        if (!session.getStartTime().isAfter(OffsetDateTime.now())) {
            return false;
        }
        return participant.getStatus() != null && participant.getStatus().canBeCancelledByTrainer();
    }
}
