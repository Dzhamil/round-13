package com.round13.backend.module.shop.dto;

import com.round13.backend.domain.OrderStatus;

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
 * @param updatedAt     дата последнего изменения заявки
 * @param itemCount     количество товаров в заказе
 * @param status        статус заказа
 * @param requestedStartTime желаемое время персональной тренировки
 * @param requestedTrainerId тренер персональной тренировки из товара
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
        OffsetDateTime updatedAt,
        int itemCount,
        OrderStatus status,
        OffsetDateTime requestedStartTime,
        UUID requestedTrainerId
) {
}
