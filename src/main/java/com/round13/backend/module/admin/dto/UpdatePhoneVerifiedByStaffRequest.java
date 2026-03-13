package com.round13.backend.module.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Запрос на установку флага верификации телефона тренером/админом.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePhoneVerifiedByStaffRequest {

    /**
     * true = телефон подтверждён тренером/админом, false = снять подтверждение.
     */
    @NotNull
    private Boolean verified;
}
