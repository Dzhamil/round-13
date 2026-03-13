// src/main/java/com/round13/backend/module/members/service/dto/MemberPointsCacheUpdate.java
package com.round13.backend.module.members.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Результат расчёта кеша очков/статуса для одной строки user_stats.
 */
@Getter
@AllArgsConstructor
public class MemberPointsCacheUpdate {

    private final int points;
    private final String statusLabel;
}
