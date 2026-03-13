package com.round13.backend.module.user.dto;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatsEntity;

/**
 * Агрегированный набор сущностей для формирования профиля пользователя.
 *
 * @param user    основная сущность пользователя (не null)
 * @param profile профиль пользователя (может быть null)
 * @param stats   статистика пользователя (может быть null)
 */
public record UserProfileBundle(
        UserEntity user,
        ProfileEntity profile,
        UserStatsEntity stats
) {}

