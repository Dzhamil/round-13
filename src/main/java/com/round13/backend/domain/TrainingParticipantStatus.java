package com.round13.backend.domain;

import java.util.EnumSet;
import java.util.Set;

/**
 * Статус участия пользователя в тренировке.
 */
public enum TrainingParticipantStatus {

    /**
     * Пользователь записан на тренировку.
     */
    BOOKED,

    /**
     * Пользователь запросил отмену, ожидается подтверждение тренера.
     */
    CANCEL_REQUESTED,

    /**
     * Отмена подтверждена без списания тренировки.
     */
    CANCELLED_FREE,

    /**
     * Отмена подтверждена со списанием тренировки.
     */
    CANCELLED_LATE,

    /**
     * Тренировка отменена тренером без списания лимита ученика.
     */
    CANCELLED_BY_TRAINER,

    /**
     * Пользователь посетил тренировку.
     */
    ATTENDED,

    /**
     * Пользователь не пришёл на тренировку.
     */
    NO_SHOW;

    public static Set<TrainingParticipantStatus> activeBookingStatuses() {
        return EnumSet.of(BOOKED, CANCEL_REQUESTED);
    }

    public static TrainingParticipantStatus cancellationResult(boolean lateCancellation) {
        return lateCancellation ? CANCELLED_LATE : CANCELLED_FREE;
    }

    public boolean isBooked() {
        return this == BOOKED;
    }

    public boolean isCancellationRequested() {
        return this == CANCEL_REQUESTED;
    }

    public boolean canBeCancelledByTrainer() {
        return this == BOOKED || this == CANCEL_REQUESTED;
    }

    public boolean chargesTrainingBalance() {
        return this == CANCELLED_LATE;
    }
}
