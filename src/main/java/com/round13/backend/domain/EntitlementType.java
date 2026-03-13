package com.round13.backend.domain;

/**
 * Тип начисления услуги пользователю после покупки.
 */
public enum EntitlementType {

    /**
     * Абонемент (действует до определённой даты).
     */
    SUBSCRIPTION,

    /**
     * Персональные тренировки (штучные).
     */
    PERSONAL_TRAINING,

    /**
     * Пакет персональных тренировок.
     */
    PACKAGE
}
