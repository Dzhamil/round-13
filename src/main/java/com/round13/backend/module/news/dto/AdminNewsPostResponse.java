package com.round13.backend.module.news.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Новость клуба для редактирования в админском контуре.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Новость клуба для администрирования")
public class AdminNewsPostResponse {

    @Schema(description = "Идентификатор новости")
    private UUID id;

    @Schema(description = "Заголовок новости", example = "Изменения расписания на март")
    private String title;

    @Schema(description = "Короткий анонс новости")
    private String excerpt;

    @Schema(description = "Полный текст новости")
    private String content;

    @Schema(description = "Новость опубликована")
    private boolean published;

    @Schema(description = "Дата публикации")
    private OffsetDateTime publishedAt;

    @Schema(description = "Дата создания")
    private OffsetDateTime createdAt;

    @Schema(description = "Дата последнего обновления")
    private OffsetDateTime updatedAt;
}
