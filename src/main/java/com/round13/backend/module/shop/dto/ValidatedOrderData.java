package com.round13.backend.module.shop.dto;

import com.round13.backend.domain.ShopProductEntity;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Валидированные данные заказа.
 *
 * @param quantities количества по productId
 * @param products товары по productId
 * @param trainingRequests запрошенные тренировочные слоты по productId
 */
public record ValidatedOrderData(
        Map<UUID, Integer> quantities,
        Map<UUID, ShopProductEntity> products,
        Map<UUID, TrainingRequestData> trainingRequests
) {

    public record TrainingRequestData(
            UUID productId,
            UUID trainerId,
            OffsetDateTime requestedStartTime
    ) {
    }
}
