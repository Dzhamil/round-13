// src/main/java/com/round13/backend/module/profile/dto/UpdateProfileRequest.java
package com.round13.backend.module.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Запрос на обновление профиля.
 */
@Schema(description = "Запрос на обновление профиля пользователя")
public record UpdateProfileRequest(

        // ===== Новые поля (то, что ты хочешь обязательным на онбординге) =====

        @Schema(description = "Никнейм", example = "iron_mike")
        @Size(max = 64)
        String nickname,

        @Schema(description = "Телефон", example = "+79990001122")
        @Size(max = 32)
        String phone,

        @Schema(description = "Скрыть телефон от других участников", example = "false")
        Boolean phoneHidden,

        @Schema(description = "Пол (MALE/FEMALE/OTHER)", example = "MALE")
        @Size(max = 16)
        String gender,

        // ===== Старые поля (оставляем, но на онбординге больше не требуем) =====

        @Schema(description = "ФИО", example = "Иван Иванов")
        @Size(max = 256)
        String fullName,

        @Schema(description = "Дата рождения", example = "2000-01-01")
        @Past
        LocalDate birthDate,

        @Schema(description = "URL аватара", example = "https://example.com/avatar.jpg")
        String avatarUrl,

        @Schema(description = "Дата дебюта в клубе", example = "2024-01-15")
        LocalDate debutDate,

        @Schema(description = "Клан (название/код)", example = "NORTH")
        @Size(max = 128)
        String clan,

        @Schema(description = "Короткая информация о себе", example = "Готовлюсь к турниру, работаю над выносливостью")
        @Size(max = 500)
        String aboutMe
) {}
