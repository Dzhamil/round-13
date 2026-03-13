package com.round13.backend.module.admin.mapper;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.admin.dto.UserDetailsResponse;
import com.round13.backend.module.admin.dto.UserListItemResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper для административных представлений пользователей.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AdminUserMapper {

    /**
     * Маппит пользователя и его профиль в элемент списка пользователей.
     */
    @Mapping(target = "id", source = "user.id")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "nickname", source = "user.nickname")
    @Mapping(target = "role", source = "user.role.code")
    @Mapping(target = "status", source = "user.status")
    @Mapping(target = "profileCompleted", source = "profile.profileCompleted")
    UserListItemResponse toListItem(UserEntity user, ProfileEntity profile);

    /**
     * Маппит пользователя и его профиль в детальный ответ.
     */
    @Mapping(target = "id", source = "user.id")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "nickname", source = "user.nickname")
    @Mapping(target = "role", source = "user.role.code")
    @Mapping(target = "status", source = "user.status")
    @Mapping(target = "telegramUserId", source = "user.telegramUserId")

    @Mapping(target = "fullName", source = "profile.fullName")
    @Mapping(target = "birthDate", source = "profile.birthDate")
    @Mapping(target = "avatarUrl", source = "profile.avatarUrl")
    @Mapping(target = "debutDate", source = "profile.debutDate")
    @Mapping(target = "clan", source = "profile.clan")
    @Mapping(target = "profileCompleted", source = "profile.profileCompleted")
    UserDetailsResponse toDetails(UserEntity user, ProfileEntity profile);
}
