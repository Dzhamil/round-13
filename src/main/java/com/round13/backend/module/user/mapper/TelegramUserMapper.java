package com.round13.backend.module.user.mapper;

import com.round13.backend.domain.RoleEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.auth.dto.TelegramUserDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

/**
 * Маппер пользователя Telegram -> UserEntity.
 * Создаёт тех. телефон и заполняет базовые поля.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TelegramUserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "telegramUserId", source = "dto.id")
    @Mapping(target = "nickname", source = "dto.username")
    @Mapping(target = "role", source = "role")
    @Mapping(target = "status", constant = "PROFILE_INCOMPLETE")
    @Mapping(target = "passwordHash", expression = "java(java.util.UUID.randomUUID().toString())")
    @Mapping(target = "phone", ignore = true)
    UserEntity toEntity(TelegramUserDto dto, RoleEntity role);
}
