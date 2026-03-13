package com.round13.backend.module.shop.dto;

import com.round13.backend.domain.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * Запрос на смену статуса заказа магазина.
 */
@Schema(description = "Запрос на обновление статуса заказа магазина")
public record UpdateShopOrderStatusRequest(
        @NotNull
        @Schema(
                description = "Новый статус заказа",
                example = "PAID",
                allowableValues = {"PAID", "CANCELED"}
        )
        OrderStatus status
) {
}
