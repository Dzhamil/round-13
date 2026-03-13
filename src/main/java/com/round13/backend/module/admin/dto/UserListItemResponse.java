package com.round13.backend.module.admin.dto;

import com.round13.backend.domain.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Элемент списка пользователей для административных экранов.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserListItemResponse {

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
     * Признак полностью заполненного профиля.
     */
    private boolean profileCompleted;
}
