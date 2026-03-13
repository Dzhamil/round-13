package com.round13.backend.module.shop.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

/**
 * Запрос на создание заказа в магазине.
 *
 * @param items позиции заказа
 */
public record CreateShopOrderRequest(

        @NotNull
        @Size(min = 1)
        List<@Valid Item> items

) {

    /**
     * Позиция заказа.
     *
     * @param productId идентификатор товара
     * @param quantity  количество единиц товара
     */
    public record Item(

            @NotNull
            UUID productId,

            @Min(1)
            int quantity

    ) {
    }
}
