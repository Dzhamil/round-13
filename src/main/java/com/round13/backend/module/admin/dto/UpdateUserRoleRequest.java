package com.round13.backend.module.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Запрос на смену роли пользователя администратором.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRoleRequest {

    /**
     * Новый код роли (ATHLETE/COACH/ADMIN).
     */
    @NotBlank
    private String roleCode;
}
