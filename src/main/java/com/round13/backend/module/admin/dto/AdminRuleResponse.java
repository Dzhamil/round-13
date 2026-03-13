package com.round13.backend.module.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Правило клуба для административного редактирования.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Правило клуба для административного редактирования")
public class AdminRuleResponse {

    @Schema(description = "Идентификатор правила")
    private UUID id;

    @Schema(description = "Код правила", example = "VISIT_TRAININGS")
    private String code;

    @Schema(description = "Заголовок правила", example = "Посещение тренировок")
    private String title;

    @Schema(description = "Текст правила")
    private String content;

    @Schema(description = "Порядок отображения", example = "10")
    private int sortOrder;

    @Schema(description = "Дата создания")
    private OffsetDateTime createdAt;

    @Schema(description = "Дата последнего обновления")
    private OffsetDateTime updatedAt;
}
