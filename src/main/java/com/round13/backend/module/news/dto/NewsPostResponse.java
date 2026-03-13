package com.round13.backend.module.news.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Публичная новость клуба.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Новость клуба для главной страницы")
public class NewsPostResponse {

    @Schema(description = "Идентификатор новости")
    private UUID id;

    @Schema(description = "Заголовок новости", example = "Изменения расписания на март")
    private String title;

    @Schema(description = "Короткий анонс новости")
    private String excerpt;

    @Schema(description = "Дата публикации новости")
    private OffsetDateTime publishedAt;
}
