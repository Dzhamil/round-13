package com.round13.backend.module.training.mapper;

import com.round13.backend.domain.TrainingSessionEntity;
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

    @Mapping(target = "sessionId", source = "id")
    @Mapping(target = "type", expression = "java(session.getType() == null ? null : session.getType().name())")
    @Mapping(target = "startsAt", source = "startTime")
    @Mapping(target = "endsAt", expression = "java(calculateEndsAt(session))")
    @Mapping(target = "coachId", source = "coach.id")
    @Mapping(target = "coachName", source = "coach.nickname")
    @Mapping(target = "canCancel", expression = "java(canCancel(session, now))")
    MyScheduleItemResponse toItem(TrainingSessionEntity session, @Context OffsetDateTime now);

    default OffsetDateTime calculateEndsAt(TrainingSessionEntity session) {
        if (session == null || session.getStartTime() == null) return null;
        Integer dm = session.getDurationMinutes();
        int minutes = Math.max(0, dm == null ? 0 : dm);
        return session.getStartTime().plusMinutes(minutes);
    }

    default boolean canCancel(TrainingSessionEntity session, OffsetDateTime now) {
        if (session == null || session.getStartTime() == null || now == null) return false;
        return session.getStartTime().isAfter(now);
    }
}

