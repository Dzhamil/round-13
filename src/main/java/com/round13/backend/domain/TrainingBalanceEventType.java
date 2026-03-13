package com.round13.backend.domain;

/**
 * Тип события изменения баланса тренировок ученика.
 */
public enum TrainingBalanceEventType {

    /**
     * Тренер вручную добавил одну тренировку в остаток ученика.
     */
    MANUAL_ADD,

    /**
     * Тренер вручную списал одну тренировку из остатка ученика.
     */
    MANUAL_DEBIT
}
