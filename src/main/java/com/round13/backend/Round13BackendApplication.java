package com.round13.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Точка входа приложения.
 *
 * ВАЖНО:
 * - @EnableScheduling нужен для cron пересчёта кеша очков/статусов в 09:00.
 * - @ConfigurationPropertiesScan нужен, чтобы подтягивались members.status.* (MemberStatusProperties).
 */
@SpringBootApplication
@EnableScheduling
@ConfigurationPropertiesScan
public class Round13BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(Round13BackendApplication.class, args);
    }
}
