package com.round13.backend.domain;

/**
 * Тип активируемой услуги/пакета для пользователя.
 */
public enum UserEntitlementType {
    PERSONAL_TRAININGS,
    GROUP_TRAININGS;

    public boolean isPersonalTrainings() {
        return this == PERSONAL_TRAININGS;
    }

    public boolean isGroupTrainings() {
        return this == GROUP_TRAININGS;
    }
}
