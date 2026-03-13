package com.round13.backend.module.info.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Запрос на создание/обновление информационной страницы администратором.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Запрос на создание/обновление информационной страницы")
public class UpsertInfoPageRequest {

    @NotBlank
    @Size(max = 256)
    @Schema(description = "Заголовок страницы", example = "О нас")
    private String title;

    @NotBlank
    @Schema(description = "Основной текст страницы")
    private String content;
}
