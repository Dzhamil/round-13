// src/main/java/com/round13/backend/module/members/dto/MemberStatus.java
package com.round13.backend.module.members.dto;

/**
 * Текстовые статусы по ТЗ (ученик/тренер).
 *
 * ВАЖНО: без полей/конструктора. Label получаем через switch.
 */
public enum MemberStatus {

    // бойцы
    FIGHTER_NEWBIE,
    FIGHTER_AMATEUR,
    FIGHTER_EXPERIENCED,
    FIGHTER_PRO,

    // тренерский состав
    COACH_NEWBIE,
    COACH,
    SENIOR_COACH;

    public String label() {
        return switch (this) {
            case FIGHTER_NEWBIE -> "Новичок";
            case FIGHTER_AMATEUR -> "Любитель";
            case FIGHTER_EXPERIENCED -> "Опытный";
            case FIGHTER_PRO -> "Профи";

            case COACH_NEWBIE -> "Тренер-новичок";
            case COACH -> "Тренер";
            case SENIOR_COACH -> "Старший тренер";
        };
    }
}
