// src/main/java/com/round13/backend/module/user/dto/UserProfileResponse.java
package com.round13.backend.module.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Публичный профиль участника (для перехода из рейтинга)")
public class UserProfileResponse {

    @Schema(description = "Идентификатор пользователя", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    private UUID id;

    @Schema(description = "Никнейм", nullable = true, example = "iron_fist")
    private String nickname;

    @Schema(description = "ФИО", nullable = true, example = "Иван Иванов")
    private String fullName;

    @Schema(description = "URL аватара", nullable = true, example = "https://cdn.round13.ru/avatars/u1.png")
    private String avatarUrl;

    @Schema(description = "Пол (MALE/FEMALE/OTHER)", nullable = true, example = "MALE")
    private String gender;

    @Schema(description = "Позиция пользователя в общем рейтинге клуба", nullable = true, example = "5")
    private Integer ratingPlace;

    @Schema(description = "Процент побед (0–100)", nullable = true, example = "67")
    private Integer winRatePercent;

    @Schema(description = "Количество побед", example = "18")
    private int winsCount;

    @Schema(description = "Количество поражений", example = "9")
    private int defeatsCount;

    @Schema(description = "Общее количество спаррингов", example = "27")
    private int sparringsCount;

    @Schema(description = "Количество посещённых тренировок", example = "32")
    private int trainingsAttendedCount;

    @Schema(description = "Стаж в клубе (в месяцах)", example = "14")
    private int clubExperienceMonths;
}
