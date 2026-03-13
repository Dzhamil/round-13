package com.round13.backend.module.user.controller;

import com.round13.backend.module.user.dto.UserProfileResponse;
import com.round13.backend.module.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Публичные операции с пользователями (доступны любому аутентифицированному пользователю).
 */
@Tag(name = "Users", description = "Публичные профили участников клуба")
@RestController
@RequestMapping(UserController.BASE_PATH)
@RequiredArgsConstructor
public class UserController {

    public static final String BASE_PATH = "/api/users";

    private final UserService userService;

    @Operation(summary = "Получить публичный профиль участника по id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Публичный профиль участника"),
            @ApiResponse(responseCode = "400", description = "Некорректный UUID"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    @GetMapping("/{id}")
    public UserProfileResponse getUserProfile(@PathVariable("id") UUID userId) {
        return userService.getUserProfile(userId);
    }
}
