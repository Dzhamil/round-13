package com.round13.backend.domain;

/**
 * Тип события по пакетам тренировок пользователя.
 */
public enum UserEntitlementEventType {
    ACTIVATED,
    RESERVED_FOR_EVENT,
    REFUNDED;

    public int signedDelta(int quantity) {
        return this == RESERVED_FOR_EVENT ? -quantity : quantity;
    }
}
