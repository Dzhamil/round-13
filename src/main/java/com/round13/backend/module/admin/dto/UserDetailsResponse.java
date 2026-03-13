package com.round13.backend.module.admin.dto;

import com.round13.backend.domain.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Детальная информация о пользователе для административных экранов.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailsResponse {

    /**
     * Идентификатор пользователя.
     */
    private String id;

    /**
     * Номер телефона пользователя.
     */
    private String phone;

    /**
     * Никнейм пользователя.
     */
    private String nickname;

    /**
     * Код роли пользователя (ATHLETE/COACH/ADMIN).
     */
    private String role;

    /**
     * Статус пользователя.
     */
    private UserStatus status;

    /**
     * Идентификатор пользователя в Telegram.
     */
    private Long telegramUserId;

    /**
     * Полное имя пользователя.
     */
    private String fullName;

    /**
     * Дата рождения пользователя.
     */
    private LocalDate birthDate;

    /**
     * URL аватара пользователя.
     */
    private String avatarUrl;

    /**
     * Дата дебюта пользователя в клубе.
     */
    private LocalDate debutDate;

    /**
     * Клан пользователя.
     */
    private String clan;

    /**
     * Признак полностью заполненного профиля.
     */
    private boolean profileCompleted;
}
