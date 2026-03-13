package com.round13.backend.module.shop.dto;

import java.util.UUID;

/**
 * DTO для возврата информации о категории.
 *
 * @param id               идентификатор категории
 * @param title            название
 * @param description      описание
 * @param previewImageUrl  URL изображения превью
 * @param active           активна ли категория
 */
public record ShopCategoryResponse(
        UUID id,
        String title,
        String description,
        String previewImageUrl,
        boolean active
) {
}
