package com.round13.backend.domain;

/**
 * Тип тренировки/занятия в расписании.
 *
 * <p>Нужен для фильтров в афише (по типу) и для бизнес-логики вместимости.</p>
 */
public enum TrainingType {

    /**
     * Групповая тренировка (есть лимит мест).
     */
    GROUP,

    /**
     * Персональная тренировка (обычно лимит 1, но оставляем как параметр capacity).
     */
    PERSONAL,

    /**
     * Открытая тренировка (как правило, без лимита мест).
     */
    OPEN;

    public boolean isPersonal() {
        return this == PERSONAL;
    }

    public boolean usesGroupEntitlement() {
        return this == GROUP || this == OPEN;
    }
}
