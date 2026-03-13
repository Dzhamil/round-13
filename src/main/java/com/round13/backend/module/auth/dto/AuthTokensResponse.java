package com.round13.backend.module.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Ответ успешной аутентификации с парой токенов.
 */
@Schema(description = "Ответ успешной аутентификации")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthTokensResponse {

    /**
     * JWT access token.
     */
    @Schema(description = "JWT access token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String accessToken;

    /**
     * Refresh token.
     */
    @Schema(description = "JWT refresh token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;
}