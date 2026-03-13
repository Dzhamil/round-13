// src/main/java/com/round13/backend/module/members/service/MemberPointsCalculator.java
package com.round13.backend.module.members.service;

import com.round13.backend.domain.UserStatsEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;

/**
 * Калькулятор очков.
 *
 * Формула по ТЗ:
 * - стаж: 1 месяц = 2 очка (фиксированная константа)
 * - + сумма "очковых" счётчиков без коэффициентов
 */
@Component
public class MemberPointsCalculator {

    public static final int TENURE_POINTS_PER_MONTH = 2;

    public int calcPoints(UserStatsEntity s, int tenureMonths) {
        int tenurePoints = Math.max(tenureMonths, 0) * TENURE_POINTS_PER_MONTH;

        return tenurePoints
                + safe(s.getTrainingsAttendedCount())
                + safe(s.getFightsCount())
                + safe(s.getWinsCount())
                + safe(s.getKnockoutsCount())
                + safe(s.getKnockdownsCount());
    }

    public int calcTenureMonths(LocalDate debutDate, LocalDate today) {
        if (debutDate == null) return 0;
        if (today == null) today = LocalDate.now();
        if (debutDate.isAfter(today)) return 0;

        Period p = Period.between(debutDate, today);
        return p.getYears() * 12 + p.getMonths();
    }

    private int safe(int v) {
        return Math.max(v, 0);
    }
}
