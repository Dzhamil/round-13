package com.round13.backend.module.shop.dto;

import com.round13.backend.domain.OrderStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Краткая информация о заказе пользователя для истории покупок.
 *
 * @param id идентификатор заказа
 * @param status статус заказа
 * @param totalAmount итоговая сумма заказа
 * @param currency валюта заказа
 * @param createdAt дата создания заказа
 */
public record ShopOrderListItemResponse(
        UUID id,
        OrderStatus status,
        int totalAmount,
        String currency,
        OffsetDateTime createdAt
) {
}
