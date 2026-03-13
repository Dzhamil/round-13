package com.round13.backend.module.shop.dto;

import com.round13.backend.domain.OrderStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Запрос на смену статуса заказа магазина.
 */
public record UpdateShopOrderStatusRequest(
        @NotNull OrderStatus status
) {
}
