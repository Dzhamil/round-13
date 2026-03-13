package com.round13.backend.module.admin.dto;

import com.round13.backend.domain.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Запрос на изменение статуса пользователя администратором.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserStatusRequest {

    /**
     * Новый статус пользователя.
     */
    @NotNull
    private UserStatus status;
}
