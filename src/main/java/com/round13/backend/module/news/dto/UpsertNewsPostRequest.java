package com.round13.backend.module.news.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

/**
 * Запрос на создание или обновление новости клуба.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Запрос на создание или обновление новости клуба")
public class UpsertNewsPostRequest {

    @NotBlank
    @Size(max = 256)
    @Schema(description = "Заголовок новости", example = "Изменения расписания на март")
    private String title;

    @Size(max = 512)
    @Schema(description = "Короткий анонс новости")
    private String excerpt;

    @NotBlank
    @Schema(description = "Полный текст новости")
    private String content;

    @NotNull
    @Schema(description = "Нужно ли показывать новость на главной", example = "true")
    private Boolean published;

    @Schema(description = "Дата публикации. Если не передана при публикации, подставится текущее время.")
    private OffsetDateTime publishedAt;
}
