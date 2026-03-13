package com.round13.backend.module.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * Запрос авторизации через Telegram Mini App.
 */
@Schema(description = "Запрос авторизации через Telegram Mini App (raw initData)")
public record TelegramInitDataRequest(

        @Schema(
                description = "Строка Telegram.WebApp.initData, полученная на фронтенде",
                example = "query_id=AAFki-gXAAAAAGSL6BeEVpV3&user=%7B%22id%22%3A123456789%7D&auth_date=1700000000&hash=abc123..."
        )
        @NotBlank
        String initData
) {}
