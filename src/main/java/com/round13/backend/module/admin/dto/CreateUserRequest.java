package com.round13.backend.module.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Запрос на создание пользователя администратором.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {

    /**
     * Номер телефона пользователя.
     */
    @NotBlank
    @Size(max = 32)
    @Pattern(regexp = "^[+0-9][0-9]{9,31}$")
    private String phone;

    /**
     * Никнейм пользователя.
     */
    @Size(max = 64)
    private String nickname;

    /**
     * Пароль пользователя в открытом виде для первичной выдачи.
     */
    @NotBlank
    @Size(min = 6, max = 72)
    private String password;

    /**
     * Код роли пользователя (ATHLETE/COACH/ADMIN).
     */
    @NotBlank
    @Size(max = 32)
    private String roleCode;
}
