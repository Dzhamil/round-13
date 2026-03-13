package com.round13.backend.module.members.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Группа участников для выдачи списка.
 */
@Schema(description = "Группа участников")
public enum MembersGroup {

    @Schema(description = "Бойцы (все кроме COACH и ADMIN)")
    FIGHTERS,

    @Schema(description = "Тренерский состав (COACH и ADMIN)")
    COACHES
}
