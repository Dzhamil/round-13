package com.round13.backend.module.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO пользователя Telegram из поля user в initData.
 * Используется ТОЛЬКО для бизнес-логики
 * (поиск / создание пользователя в системе).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TelegramUserDto {

    /**
     * Telegram user id — основной идентификатор.
     */
    @NotNull
    @JsonProperty("id")
    private Long id;

    /**
     * username без @ (может быть null).
     */
    @JsonProperty("username")
    private String username;

    /**
     * Имя пользователя.
     */
    @JsonProperty("first_name")
    private String firstName;

    /**
     * Фамилия пользователя.
     */
    @JsonProperty("last_name")
    private String lastName;
}
