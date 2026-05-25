package com.round13.backend.module.members.mapper;

import com.round13.backend.module.members.dto.MemberListItemResponse;
import com.round13.backend.module.members.dto.MemberListItemRow;
import org.mapstruct.Mapper;
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

    default MemberListItemResponse toListItem(MemberListItemRow row) {
        if (row == null) {
            return null;
        }

        return new MemberListItemResponse(
                uuidToString(row.id()),
                row.nickname(),
                row.phoneHidden() ? null : row.phone(),
                row.phoneHidden(),
                row.avatarUrl(),
                nullSafePoints(row.points()),
                row.statusLabel(),
                row.roleCode(),
                row.remainingTrainings(),
                uuidToString(row.trainerStudentLinkId()),
                uuidToString(row.trainerId()),
                row.trainerName()
        );
    }

    @Named("uuidToString")
    default String uuidToString(UUID id) {
        return id == null ? null : id.toString();
    }

    @Named("nullSafePoints")
    default int nullSafePoints(Integer points) {
        return points == null ? 0 : points;
    }
}
