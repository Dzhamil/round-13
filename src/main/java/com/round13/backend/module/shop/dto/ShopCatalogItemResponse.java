package com.round13.backend.module.shop.dto;

import java.util.UUID;

/**
 * Элемент каталога магазина.
 *
 * @param id             идентификатор товара
 * @param code           стабильный код
 * @param title          название
 * @param description    описание
 * @param categoryId     идентификатор категории
 * @param categoryTitle  название категории
 * @param priceAmount    цена в минимальных денежных единицах
 * @param currency       валюта
 * @param imageDataUrl   data URL изображения
 * @param isActive       активен ли товар
 * @param sortOrder      порядок сортировки
 */
public record ShopCatalogItemResponse(
        UUID id,
        String code,
        String title,
        String description,
        UUID categoryId,
        String categoryTitle,
        int priceAmount,
        String currency,
        String imageDataUrl,
        boolean isActive,
        int sortOrder
) {
}
