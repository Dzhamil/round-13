// src/main/java/com/round13/backend/module/profile/controller/ProfileController.java
package com.round13.backend.module.profile.controller;

import com.round13.backend.module.profile.dto.MeResponse;
import com.round13.backend.module.profile.dto.UpdateAboutMeRequest;
import com.round13.backend.module.profile.dto.UpdateProfileRequest;
import com.round13.backend.module.profile.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Account", description = "Операции с текущим пользователем")
@RestController
@RequestMapping(ProfileController.BASE_PATH)
@RequiredArgsConstructor
public class ProfileController {

    public static final String BASE_PATH = "/api/account";

    private final ProfileService profileService;

    @Operation(summary = "Обновить профиль текущего пользователя")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Профиль обновлён"),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @PatchMapping("/profile")
    public MeResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        return profileService.updateMyProfile(userId, request);
    }

    @Operation(
            summary = "Обновить поле 'О себе'",
            description = "Обновляет короткую информацию о пользователе в профиле"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Поле 'О себе' обновлено"),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @PatchMapping("/profile/about")
    public MeResponse updateAboutMe(
            Authentication authentication,
            @Valid @RequestBody UpdateAboutMeRequest request
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        return profileService.updateAboutMe(userId, request);
    }

    @Operation(
            summary = "Завершение онбординга профиля",
            description = "Заполняет обязательные поля профиля и при заполненности переводит статус в ACTIVE"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Профиль успешно заполнен"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные профиля"),
            @ApiResponse(responseCode = "401", description = "Пользователь не аутентифицирован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён"),
            @ApiResponse(responseCode = "404", description = "Пользователь или профиль не найден")
    })
    @PostMapping("/complete-profile")
    public MeResponse completeProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        return profileService.completeProfile(userId, request);
    }

    @Operation(summary = "Получить данные текущего пользователя")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Данные пользователя"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @GetMapping("/me")
    public MeResponse me(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return profileService.getMe(userId);
    }
}
