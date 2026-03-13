package com.round13.backend.module.info.mapper;

import com.round13.backend.domain.TrainingSessionEntity;
import com.round13.backend.domain.TrainingType;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.info.dto.TrainingSessionResponse;
import com.round13.backend.module.admin.dto.UpsertTrainingSessionRequest;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.UUID;

/**
 * Маппер тренировочных сессий.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
@RequiredArgsConstructor
public abstract class TrainingSessionMapper {

    @Autowired
    protected UserRepository userRepository;

    /**
     * Применяет значения запроса к существующей сущности.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "title", qualifiedByName = "normalize")
    @Mapping(target = "description", qualifiedByName = "normalize")
    @Mapping(target = "location", qualifiedByName = "normalize")
    @Mapping(target = "type", source = "type", qualifiedByName = "parseTrainingType")
    @Mapping(target = "coach", source = "coachUserId", qualifiedByName = "resolveCoach")
    public abstract void apply(UpsertTrainingSessionRequest request, @MappingTarget TrainingSessionEntity entity);

    /**
     * Преобразует сущность тренировки в DTO.
     *
     * @param entity            сущность тренировки
     * @param participantsCount число записанных участников
     */
    @Mapping(target = "id", source = "entity.id")
    @Mapping(target = "title", source = "entity.title")
    @Mapping(target = "description", source = "entity.description")
    @Mapping(target = "type", source = "entity.type", qualifiedByName = "trainingTypeToString")
    @Mapping(target = "startTime", source = "entity.startTime")
    @Mapping(target = "durationMinutes", source = "entity.durationMinutes")
    @Mapping(target = "capacity", source = "entity.capacity")
    @Mapping(target = "location", source = "entity.location")
    @Mapping(target = "coachUserId", source = "entity.coach", qualifiedByName = "coachToId")
    @Mapping(target = "coachName", source = "entity.coach", qualifiedByName = "coachToNickname")
    @Mapping(target = "participantsCount", source = "participantsCount")
    public abstract TrainingSessionResponse toResponse(TrainingSessionEntity entity, long participantsCount);

    /**
     * Преобразует список тренировок в список DTO.
     */
    public abstract List<TrainingSessionResponse> toResponseList(List<TrainingSessionEntity> items);

    /* ===== Named helpers (из первого маппера + для response-маппинга) ===== */

    @Named("normalize")
    protected String normalize(String value) {
        if (value == null) {
            return null;
        }
        String v = value.trim();
        return v.isBlank() ? null : v;
    }

    @Named("parseTrainingType")
    protected TrainingType parseTrainingType(String type) {
        try {
            return TrainingType.valueOf(type.trim().toUpperCase());
        } catch (RuntimeException ex) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
    }

    @Named("resolveCoach")
    protected UserEntity resolveCoach(UUID coachUserId) {
        if (coachUserId == null) {
            return null;
        }
        return userRepository.findById(coachUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    @Named("trainingTypeToString")
    protected String trainingTypeToString(TrainingType type) {
        return type == null ? null : type.name();
    }

    @Named("coachToId")
    protected UUID coachToId(UserEntity coach) {
        return coach == null ? null : coach.getId();
    }

    @Named("coachToNickname")
    protected String coachToNickname(UserEntity coach) {
        return coach == null ? null : coach.getNickname();
    }
}
