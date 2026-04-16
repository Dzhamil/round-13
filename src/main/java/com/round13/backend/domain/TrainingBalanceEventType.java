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
    MANUAL_DEBIT,

    /**
     * Списание тренировки за позднюю отмену.
     */
    LATE_CANCEL_DEBIT,

    /**
     * Списание тренировки за подтверждённое посещение.
     */
    ATTENDED_DEBIT,

    /**
     * Списание тренировки за неявку.
     */
    NO_SHOW_DEBIT;

    public static TrainingBalanceEventType manualAdjustmentForDelta(int balanceDelta) {
        if (balanceDelta == 0) {
            throw new IllegalArgumentException("balanceDelta must not be zero");
        }
        return balanceDelta > 0 ? MANUAL_ADD : MANUAL_DEBIT;
    }
}
