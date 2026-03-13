package com.round13.backend.module.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * DTO запроса для редактирования статистики пользователя администратором или тренером.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateStatsRequest {

    /** Идентификатор пользователя, статистику которого редактируем */
    @NotNull
    private UUID userId;

    /** Общее количество боев */
    @Min(0)
    private int fightsCount;

    /** Количество побед */
    @Min(0)
    private int winsCount;

    /** Количество поражений */
    @Min(0)
    private int defeatsCount;

    /** Количество побед нокаутом */
    @Min(0)
    private int knockoutsCount;

    /** Количество нокдаунов */
    @Min(0)
    private int knockdownsCount;
}
