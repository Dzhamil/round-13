// src/main/java/com/round13/backend/module/members/service/MemberPointsCacheScheduler.java
package com.round13.backend.module.members.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Планировщик пересчёта кеша points/status_label в user_stats.
 * По ТЗ: обновление раз в сутки, утром в 09:00.
 */
@Component
@RequiredArgsConstructor
public class MemberPointsCacheScheduler {

    private final MemberPointsCacheService memberPointsCacheService;

    /**
     * Каждый день в 09:00 (фиксируем зону явно).
     */
    @Scheduled(cron = "0 0 9 * * *", zone = "Europe/Moscow")
    public void recalcDaily() {
        memberPointsCacheService.recalcAll();
    }
}
