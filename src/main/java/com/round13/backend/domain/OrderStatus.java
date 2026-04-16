package com.round13.backend.domain;

import java.util.List;

/**
 * Статус заказа в магазине.
 */
public enum OrderStatus {

    /**
     * Заказ создан, ожидает оплаты.
     */
    PENDING,

    /**
     * Заказ успешно оплачен.
     */
    PAID,

    /**
     * Заказ отменён пользователем или администратором.
     */
    CANCELED,

    /**
     * Оплата не прошла / заказ завершён с ошибкой.
     */
    FAILED;

    private static final List<OrderStatus> PROCESSED_STATUSES = List.of(PAID, CANCELED, FAILED);

    public static List<OrderStatus> processedStatuses() {
        return PROCESSED_STATUSES;
    }

    public boolean isPending() {
        return this == PENDING;
    }

    public boolean canBeSetByAdmin() {
        return this == PAID || this == CANCELED;
    }

    public boolean isPaid() {
        return this == PAID;
    }
}
