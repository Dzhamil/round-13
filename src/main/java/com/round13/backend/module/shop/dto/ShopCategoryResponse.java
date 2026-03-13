package com.round13.backend.module.shop.dto;

import com.round13.backend.domain.ShopCategoryType;

import java.util.UUID;

/**
 * DTO для возврата информации о категории.
 *
 * @param id               идентификатор категории
 * @param title            название
 * @param description      описание
 * @param type             тип категории
 * @param previewImageUrl  URL изображения превью
 * @param active           активна ли категория
 */
public record ShopCategoryResponse(
        UUID id,
        String title,
        String description,
        ShopCategoryType type,
        String previewImageUrl,
        boolean active
) {
}
