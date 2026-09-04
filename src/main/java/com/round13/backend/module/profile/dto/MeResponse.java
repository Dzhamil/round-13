// src/main/java/com/round13/backend/module/profile/dto/MeResponse.java
package com.round13.backend.module.profile.dto;

import com.round13.backend.domain.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

/**
 * Ответ с данными текущего пользователя.
 */
@Schema(description = "Данные текущего пользователя")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MeResponse {

    @Schema(description = "ID пользователя", example = "550e8400-e29b-41d4-a716-446655440000")
    private String id;

    @Schema(description = "Телефон", example = "+79990001122")
    private String phone;

    @Schema(description = "Телефон скрыт от других участников", example = "false")
    private boolean phoneHidden;

    @Schema(description = "Никнейм", example = "sparring_king")
    private String nickname;

    @Schema(description = "Код роли", example = "ATHLETE")
    private String role;

    @Schema(description = "Статус пользователя", example = "ACTIVE")
    private UserStatus status;

    @Schema(description = "Telegram userId", example = "123456789")
    private Long telegramUserId;

    @Schema(description = "ФИО", example = "Иван Иванов")
    private String fullName;

    @Schema(description = "Дата рождения", example = "2000-01-01")
    private LocalDate birthDate;

    @Schema(description = "URL аватара", example = "https://example.com/avatar.jpg")
    private String avatarUrl;

    @Schema(description = "Пол (MALE/FEMALE/OTHER)", example = "MALE")
    private String gender;

    @Schema(description = "Профиль заполнен", example = "true")
    private boolean profileCompleted;

    @Schema(description = "Дата дебюта в клубе", example = "2024-01-15")
    private LocalDate debutDate;

    @Schema(description = "Клан", example = "NORTH")
    private String clan;

    @Schema(description = "О себе (profiles.about_me)", example = "Люблю спарринги и тяжёлые раунды")
    private String aboutMe;

    @Schema(description = "Телефон верифицирован тренером/админом (users.phone_verified_by_staff)", example = "true")
    private boolean phoneVerifiedByStaff;

    @Schema(description = "Настроен ли пароль для web-входа", example = "true")
    private boolean webPasswordConfigured;

    @Schema(description = "Активные услуги/пакеты пользователя")
    private List<ProfileEntitlementResponse> entitlements;
}
