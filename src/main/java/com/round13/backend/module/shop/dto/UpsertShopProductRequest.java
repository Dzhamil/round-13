package com.round13.backend.module.shop.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Запрос на создание/редактирование товара магазина.
 *
 * @param title       название товара
 * @param description описание товара
 * @param categoryId  идентификатор категории
 * @param priceAmount цена в минимальных денежных единицах
 * @param currency    валюта (по умолчанию RUB)
 * @param imageDataUrl data URL загруженного изображения
 * @param active      флаг активности (опционально)
 * @param sortOrder   порядок сортировки (опционально)
 */
public record UpsertShopProductRequest(
        @NotBlank @Size(max = 256) String title,
        @NotBlank @Size(max = 4000) String description,
        @NotNull UUID categoryId,
        @NotNull @Min(0) Integer priceAmount,
        @Size(max = 8) String currency,
        String imageDataUrl,
        Boolean active,
        Integer sortOrder
) {
}
