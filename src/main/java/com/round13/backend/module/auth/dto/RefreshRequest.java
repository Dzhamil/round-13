package com.round13.backend.module.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Запрос на обновление пары токенов.
 */
@Schema(description = "Запрос на обновление access/refresh токенов")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RefreshRequest {

        /**
         * Refresh-токен (сырой, как выдан клиенту).
         */
        @Schema(description = "Refresh-токен", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        @NotBlank
        private String refreshToken;
}
