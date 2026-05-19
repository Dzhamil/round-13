// src/main/java/com/round13/backend/module/members/mapper/MemberDetailsMapper.java
package com.round13.backend.module.members.mapper;

import com.round13.backend.module.members.dto.MemberDetailsResponse;
import com.round13.backend.module.user.dto.UserProfileBundle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct‑маппер детальной карточки участника.
 *
 * <p>Вычисляемые поля (tenureMonths, trainingsConductedCount, studentsCount,
 * aboutMe, myStudent) заполняются в сервисе. Поля defeatsCount,
 * knockoutsCount и knockdownsCount берутся из UserStatsEntity и
 * автоматически пробрасываются.</p>
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface MemberDetailsMapper {

    @Mapping(target = "id", expression = "java(bundle.user().getId().toString())")
    @Mapping(target = "nickname", expression = "java(bundle.user().getNickname())")
    @Mapping(target = "phone", expression = "java(bundle.user().getPhone())")
    @Mapping(target = "phoneHidden", expression = "java(bundle.user().isPhoneHidden())")
    @Mapping(target = "roleCode", expression = "java(bundle.user().getRole() == null ? null : bundle.user().getRole().getCode())")
    @Mapping(target = "avatarUrl", expression = "java(bundle.profile() == null ? null : bundle.profile().getAvatarUrl())")

    // Кешированные значения из user_stats
    @Mapping(target = "points", expression = "java(bundle.stats() == null ? 0 : bundle.stats().getPoints())")
    @Mapping(target = "statusLabel", expression = "java(bundle.stats() == null ? \"—\" : bundle.stats().getStatusLabel())")
    @Mapping(target = "trainingsAttendedCount", expression = "java(bundle.stats() == null ? null : bundle.stats().getTrainingsAttendedCount())")
    @Mapping(target = "fightsCount", expression = "java(bundle.stats() == null ? null : bundle.stats().getFightsCount())")
    @Mapping(target = "winsCount", expression = "java(bundle.stats() == null ? null : bundle.stats().getWinsCount())")
    @Mapping(target = "defeatsCount", expression = "java(bundle.stats() == null ? null : bundle.stats().getDefeatsCount())")
    @Mapping(target = "knockoutsCount", expression = "java(bundle.stats() == null ? null : bundle.stats().getKnockoutsCount())")
    @Mapping(target = "knockdownsCount", expression = "java(bundle.stats() == null ? null : bundle.stats().getKnockdownsCount())")

    // Эти поля сервис заполнит после маппинга
    @Mapping(target = "tenureMonths", ignore = true)
    @Mapping(target = "trainingsConductedCount", ignore = true)
    @Mapping(target = "studentsCount", ignore = true)
    @Mapping(target = "aboutMe", ignore = true)
    @Mapping(target = "myStudent", ignore = true)
    @Mapping(target = "remainingTrainings", ignore = true)
    @Mapping(target = "trainerStudentCard", ignore = true)
    MemberDetailsResponse toDetails(UserProfileBundle bundle);
}
