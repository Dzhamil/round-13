package com.round13.backend.module.members.mapper;

import com.round13.backend.module.members.dto.MemberListItemRow;
import com.round13.backend.module.members.dto.MemberListItemResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.ReportingPolicy;

import java.util.UUID;

/**
 * MapStruct-маппер для выдачи списка участников.
 */
@Mapper(
        componentModel = "spring",
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface MembersMapper {

    @Mapping(target = "id", source = "id", qualifiedByName = "uuidToString")
    @Mapping(target = "trainerStudentLinkId", source = "trainerStudentLinkId", qualifiedByName = "uuidToString")
    @Mapping(target = "trainerId", source = "trainerId", qualifiedByName = "uuidToString")
    @Mapping(target = "points", source = "points", qualifiedByName = "nullSafePoints")
    MemberListItemResponse toListItem(MemberListItemRow row);

    @Named("uuidToString")
    default String uuidToString(UUID id) {
        return id == null ? null : id.toString();
    }

    @Named("nullSafePoints")
    default int nullSafePoints(Integer points) {
        return points == null ? 0 : points;
    }
}
