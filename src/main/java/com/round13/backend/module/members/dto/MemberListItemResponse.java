package com.round13.backend.module.members.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Элемент списка участников клуба (для миникарточки на фронте).
 */
@Schema(description = "Элемент списка участников")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberListItemResponse {

    @Schema(description = "ID пользователя", example = "550e8400-e29b-41d4-a716-446655440000")
    private String id;

    @Schema(description = "Никнейм пользователя", example = "sparring_king")
    private String nickname;

    @Schema(description = "Телефон пользователя", example = "+79990001122")
    private String phone;

    @Schema(description = "URL аватарки", example = "https://.../avatar.jpg")
    private String avatarUrl;

    @Schema(description = "Очки (кеш)", example = "120")
    private int points;

    @Schema(description = "Текстовый статус (кеш)", example = "Новичок")
    private String statusLabel;

    @Schema(description = "Код роли пользователя (ATHLETE/COACH/ADMIN)", example = "ATHLETE")
    private String roleCode;

    @Schema(description = "Остаток персональных тренировок у тренера", example = "8", nullable = true)
    private Integer remainingTrainings;

    @Schema(description = "ID связи тренер-ученик для контекстного удаления", nullable = true)
    private String trainerStudentLinkId;

    @Schema(description = "ID тренера в контексте связи", nullable = true)
    private String trainerId;

    @Schema(description = "Имя тренера в контексте связи", nullable = true)
    private String trainerName;
}
