package com.round13.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Точка входа приложения.
 */
@SpringBootApplication
@EnableScheduling
public class Round13BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(Round13BackendApplication.class, args);
    }
}
