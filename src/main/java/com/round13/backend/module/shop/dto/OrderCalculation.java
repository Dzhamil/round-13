package com.round13.backend.module.shop.dto;

/**
 * Результат расчёта заказа.
 *
 * @param totalAmount итоговая сумма
 * @param currency валюта
 */
public record OrderCalculation(
        int totalAmount,
        String currency
) {
}
