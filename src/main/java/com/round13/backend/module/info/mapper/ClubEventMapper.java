package com.round13.backend.module.info.mapper;

import com.round13.backend.domain.ClubEventEntity;
import com.round13.backend.module.info.dto.ClubEventResponse;
import com.round13.backend.module.info.dto.CreateClubEventRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ClubEventMapper {

    ClubEventResponse toResponse(ClubEventEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void update(CreateClubEventRequest request, @MappingTarget ClubEventEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ClubEventEntity create(CreateClubEventRequest request);
}
