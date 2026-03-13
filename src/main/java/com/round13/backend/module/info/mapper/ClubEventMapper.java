package com.round13.backend.module.info.mapper;

import com.round13.backend.domain.ClubEventEntity;
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
    ClubEventResponse toResponse(ClubEventEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "title", source = "title", qualifiedByName = "normalize")
    @Mapping(target = "description", source = "description", qualifiedByName = "normalize")
    @Mapping(target = "location", source = "location", qualifiedByName = "normalize")
    void update(CreateClubEventRequest request, @MappingTarget ClubEventEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "title", source = "title", qualifiedByName = "normalize")
    @Mapping(target = "description", source = "description", qualifiedByName = "normalize")
    @Mapping(target = "location", source = "location", qualifiedByName = "normalize")
    ClubEventEntity create(CreateClubEventRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "title", source = "title", qualifiedByName = "normalize")
    @Mapping(target = "description", source = "description", qualifiedByName = "normalize")
    @Mapping(target = "location", source = "location", qualifiedByName = "normalize")
    ClubEventEntity create(CreateCoachTrainingEventRequest request);

    @Named("normalize")
    default String normalize(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
