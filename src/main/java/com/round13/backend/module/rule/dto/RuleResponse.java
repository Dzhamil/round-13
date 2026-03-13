package com.round13.backend.module.rule.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "Правило клуба для публичного отображения")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RuleResponse {

    @Schema(description = "Код правила", example = "GENERAL_01")
    private String code;

    @Schema(description = "Заголовок правила", example = "Правила посещения")
    private String title;

    @Schema(description = "Текст правила", example = "Приходить за 10 минут до начала тренировки.")
    private String content;

    @Schema(description = "Порядок отображения", example = "10")
    private int sortOrder;
}
