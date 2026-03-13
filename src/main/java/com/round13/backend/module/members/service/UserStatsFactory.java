package com.round13.backend.module.members.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatsEntity;
import org.springframework.stereotype.Component;

/**
 * Фабрика стартовой статистики пользователя.
 */
@Component
public class UserStatsFactory {

    private static final String DEFAULT_STATUS_LABEL = "—";

    public UserStatsEntity createEmpty(UserEntity user) {
        UserStatsEntity stats = new UserStatsEntity();
        stats.setUserId(user.getId());
        stats.setUser(user);
        stats.setFightsCount(0);
        stats.setWinsCount(0);
        stats.setDefeatsCount(0);
        stats.setKnockoutsCount(0);
        stats.setKnockdownsCount(0);
        stats.setTrainingsAttendedCount(0);
        stats.setPoints(0);
        stats.setStatusLabel(DEFAULT_STATUS_LABEL);
        return stats;
    }
}
