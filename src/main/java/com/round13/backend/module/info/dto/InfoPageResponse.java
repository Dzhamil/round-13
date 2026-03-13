package com.round13.backend.module.info.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Ответ с информационной страницей (например, "О нас").
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Информационная страница клуба")
public class InfoPageResponse {

    @Schema(description = "Код страницы", example = "about")
    private String code;

    @Schema(description = "Заголовок страницы", example = "О нас")
    private String title;

    @Schema(description = "Основной текст страницы")
    private String content;

    @Schema(description = "Дата последнего обновления")
    private OffsetDateTime updatedAt;
}
