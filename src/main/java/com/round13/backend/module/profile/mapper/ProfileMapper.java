package com.round13.backend.module.profile.mapper;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.profile.dto.MeResponse;
import com.round13.backend.module.profile.dto.UpdateProfileRequest;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper для работы с профилем пользователя.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProfileMapper {

    /**
     * Обновляет сущность профиля данными из запроса.
     * Null-поля запроса не должны затирать существующие значения.
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProfile(UpdateProfileRequest request, @MappingTarget ProfileEntity profile);

    /**
     * Создаёт пустой профиль для нового пользователя.
     */
    @Mapping(target = "user", source = "user")
    @Mapping(target = "profileCompleted", ignore = true)
    @Mapping(target = "gender", ignore = true)
    @Mapping(target = "aboutMe", ignore = true)
    ProfileEntity createEmpty(UserEntity user);

    /**
     * Объединяет UserEntity и ProfileEntity в единый DTO ответа текущего пользователя.
     */
    @Mapping(target = "id", expression = "java(user.getId() != null ? user.getId().toString() : null)")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "phoneHidden", source = "user.phoneHidden")
    @Mapping(target = "nickname", source = "user.nickname")
    @Mapping(target = "role", source = "user.role.code")
    @Mapping(target = "status", source = "user.status")
    @Mapping(target = "telegramUserId", source = "user.telegramUserId")
    @Mapping(target = "fullName", source = "profile.fullName")
    @Mapping(target = "birthDate", source = "profile.birthDate")
    @Mapping(target = "avatarUrl", source = "profile.avatarUrl")
    @Mapping(target = "gender", source = "profile.gender")
    @Mapping(target = "profileCompleted", source = "profile.profileCompleted")
    @Mapping(target = "debutDate", source = "profile.debutDate")
    @Mapping(target = "clan", source = "profile.clan")
    @Mapping(target = "aboutMe", source = "profile.aboutMe")
    @Mapping(target = "phoneVerifiedByStaff", source = "user.phoneVerifiedByStaff")
    @Mapping(target = "webPasswordConfigured", expression = "java(user.getPasswordHash() != null && user.getPasswordHash().startsWith(\"$2\"))")
    MeResponse toMeResponse(UserEntity user, ProfileEntity profile);
}
