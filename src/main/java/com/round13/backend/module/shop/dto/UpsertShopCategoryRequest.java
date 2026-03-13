package com.round13.backend.module.shop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Запрос на создание/редактирование категории.
 *
 * @param title           название категории
 * @param description     описание
 * @param previewImageUrl URL превью-картинки (опционально)
 * @param active          флаг активности (опционально)
 */
public record UpsertShopCategoryRequest(
        @NotBlank @Size(max = 128) String title,
        @NotBlank @Size(max = 2000) String description,
        String previewImageUrl,
        Boolean active
) {
}
