package com.round13.backend.module.shop.dto;

import java.util.UUID;

/**
 * DTO для отображения заявки на покупку (pending order).
 *
 * @param id            идентификатор заказа
 * @param buyerName     имя/ник покупателя
 * @param avatarUrl     URL аватарки (опционально)
 * @param category      название категории
 * @param productTitle  название товара
 */
public record PurchaseRequestDto(
        UUID id,
        String buyerName,
        String avatarUrl,
        String category,
        String productTitle
) {
}
