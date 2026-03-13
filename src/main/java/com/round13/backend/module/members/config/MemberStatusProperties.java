package com.round13.backend.module.members.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Пороги статусов по очкам.
 */
@Configuration
@ConfigurationProperties(prefix = "members.status")
@Getter
@Setter
public class MemberStatusProperties {

    /**
     * Для учеников:
     * < amateurMin -> новичок
     * < experiencedMin -> любитель
     * < proMin -> опытный
     * >= proMin -> профи
     */
    private int amateurMin = 50;
    private int experiencedMin = 150;
    private int proMin = 300;

    /**
     * Для тренеров:
     * < coachMin -> тренер-новичок
     * < seniorCoachMin -> тренер
     * >= seniorCoachMin -> старший тренер
     */
    private int coachMin = 80;
    private int seniorCoachMin = 220;
}
