package com.round13.backend.module.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "Запрос на создание или обновление правила клуба")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpsertRuleRequest {

    @Schema(description = "Код правила", example = "VISIT_TRAININGS")
    @NotBlank
    private String code;

    @Schema(description = "Заголовок правила", example = "Посещение тренировок")
    @NotBlank
    private String title;

    @Schema(description = "Текст правила", example = "Участник обязан предупреждать о пропуске тренировки заранее.")
    @NotBlank
    private String content;

    @Schema(description = "Порядок отображения", example = "10")
    @NotNull
    private Integer sortOrder;
}
