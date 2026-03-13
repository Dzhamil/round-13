package com.round13.backend.module.shop.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO для отображения заявки на покупку (pending order).
 *
 * @param id            идентификатор заказа
 * @param buyerName     имя/ник покупателя
 * @param avatarUrl     URL аватарки (опционально)
 * @param category      название категории
 * @param productTitle  название товара
 * @param totalAmount   сумма заказа в минимальных единицах
 * @param currency      валюта заказа
 * @param createdAt     дата создания заявки
 * @param itemCount     количество товаров в заказе
 */
public record PurchaseRequestDto(
        UUID id,
        String buyerName,
        String avatarUrl,
        String category,
        String productTitle,
        int totalAmount,
        String currency,
        OffsetDateTime createdAt,
        int itemCount
) {
}
