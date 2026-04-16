package com.round13.backend.module.training.mapper;

import com.round13.backend.domain.TrainingParticipantEntity;
import com.round13.backend.domain.TrainingParticipantStatus;
import com.round13.backend.module.training.dto.MyScheduleItemResponse;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.time.OffsetDateTime;

/**
 * Маппер для "Моего расписания".
 *
 * <p>1 класс = 1 ответственность: здесь только преобразование сущностей в DTO.</p>
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MyScheduleMapper {

    @Mapping(target = "sessionId", source = "participant.session.id")
    @Mapping(target = "type", expression = "java(participant.getSession().getType() == null ? null : participant.getSession().getType().name())")
    @Mapping(target = "startsAt", source = "participant.session.startTime")
    @Mapping(target = "endsAt", expression = "java(participant.getSession().getEndTime())")
    @Mapping(target = "coachId", source = "participant.session.coach.id")
    @Mapping(target = "coachName", source = "participant.session.coach.nickname")
    @Mapping(target = "status", expression = "java(participant.getStatus() == null ? null : participant.getStatus().name())")
    @Mapping(target = "canCancel", expression = "java(canCancel(participant, now))")
    MyScheduleItemResponse toItem(TrainingParticipantEntity participant, @Context OffsetDateTime now);

    default boolean canCancel(TrainingParticipantEntity participant, OffsetDateTime now) {
        if (participant == null || participant.getSession() == null || participant.getSession().getStartTime() == null || now == null) {
            return false;
        }
        TrainingParticipantStatus status = participant.getStatus();
        return status != null && status.isBooked() && participant.getSession().getStartTime().isAfter(now);
    }
}
