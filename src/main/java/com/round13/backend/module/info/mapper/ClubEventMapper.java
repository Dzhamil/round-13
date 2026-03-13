package com.round13.backend.module.info.mapper;

import com.round13.backend.domain.ClubEventEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.info.dto.ClubEventResponse;
import com.round13.backend.module.info.dto.CreateClubEventRequest;
import com.round13.backend.module.training.dto.CreateCoachTrainingEventRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ClubEventMapper {

    @Mapping(target = "createdByUserId", source = "createdBy.id")
    @Mapping(target = "createdByName", expression = "java(resolveCreatedByName(entity))")
    @Mapping(target = "trainerUserId", source = "trainer.id")
    @Mapping(target = "trainerName", expression = "java(resolveTrainerName(entity))")
    ClubEventResponse toResponse(ClubEventEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "trainer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "title", source = "title", qualifiedByName = "normalize")
    @Mapping(target = "description", source = "description", qualifiedByName = "normalize")
    @Mapping(target = "location", source = "location", qualifiedByName = "normalize")
    void update(CreateClubEventRequest request, @MappingTarget ClubEventEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "trainer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "title", source = "title", qualifiedByName = "normalize")
    @Mapping(target = "description", source = "description", qualifiedByName = "normalize")
    @Mapping(target = "location", source = "location", qualifiedByName = "normalize")
    ClubEventEntity create(CreateClubEventRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "trainer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "title", source = "title", qualifiedByName = "normalize")
    @Mapping(target = "description", source = "description", qualifiedByName = "normalize")
    @Mapping(target = "location", source = "location", qualifiedByName = "normalize")
    ClubEventEntity create(CreateCoachTrainingEventRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "trainer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "title", source = "title", qualifiedByName = "normalize")
    @Mapping(target = "description", source = "description", qualifiedByName = "normalize")
    @Mapping(target = "location", source = "location", qualifiedByName = "normalize")
    void update(CreateCoachTrainingEventRequest request, @MappingTarget ClubEventEntity entity);

    @Named("normalize")
    default String normalize(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    default String resolveCreatedByName(ClubEventEntity entity) {
        return resolveUserLabel(entity == null ? null : entity.getCreatedBy());
    }

    default String resolveTrainerName(ClubEventEntity entity) {
        return resolveUserLabel(entity == null ? null : entity.getTrainer());
    }

    default String resolveUserLabel(UserEntity user) {
        if (user == null) {
            return null;
        }

        String nickname = normalize(user.getNickname());
        if (nickname != null) {
            return nickname;
        }

        return normalize(user.getPhone());
    }
}
