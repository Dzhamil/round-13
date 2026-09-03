package com.round13.backend.module.auth.controller;

import com.round13.backend.module.auth.dto.AuthTokensResponse;
import com.round13.backend.module.auth.dto.RefreshRequest;
import com.round13.backend.module.auth.dto.PhonePasswordLoginRequest;
import com.round13.backend.module.auth.dto.TelegramInitDataRequest;
import com.round13.backend.module.auth.service.AuthService;
import com.round13.backend.module.auth.service.TelegramInitDataValidationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Контроллер аутентификации.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Аутентификация и авторизация")
public class AuthController {

    private final AuthService authService;
    private final TelegramInitDataValidationService telegramInitDataValidationService;

    @Operation(summary = "Вход через Telegram WebApp")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Успешный вход"),
            @ApiResponse(responseCode = "400", description = "Некорректный запрос"),
            @ApiResponse(responseCode = "401", description = "Ошибка валидации initData/подписи"),
            @ApiResponse(responseCode = "403", description = "Пользователь заблокирован")
    })
    @PostMapping("/telegram-login")
    public AuthTokensResponse telegramLogin(@Valid @RequestBody TelegramInitDataRequest request) {
        telegramInitDataValidationService.validate(request);
        return authService.loginByTelegram(request);
    }

    @Operation(summary = "Web-вход по телефону и паролю")
    @PostMapping("/login")
    public AuthTokensResponse phonePasswordLogin(@Valid @RequestBody PhonePasswordLoginRequest request) {
        return authService.loginByPhoneAndPassword(request);
    }

    @Operation(summary = "Обновление access/refresh токенов")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Токены обновлены"),
            @ApiResponse(responseCode = "400", description = "Некорректный запрос"),
            @ApiResponse(responseCode = "401", description = "Refresh-токен недействителен/истек/отозван"),
            @ApiResponse(responseCode = "403", description = "Пользователь заблокирован")
    })
    @PostMapping("/refresh")
    public AuthTokensResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request.getRefreshToken());
    }

    @Operation(summary = "Выход пользователя")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Сессия завершена"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        authService.logout(userId);
    }
}
