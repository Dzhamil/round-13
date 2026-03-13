package com.round13.backend.module.members.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Детальная карточка участника клуба (для модалки).
 */
@Schema(description = "Детальная карточка участника клуба")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberDetailsResponse {

    @Schema(description = "ID пользователя", example = "550e8400-e29b-41d4-a716-446655440000")
    private String id;

    @Schema(description = "Никнейм", example = "sparring_king")
    private String nickname;

    @Schema(description = "Телефон", example = "+79990001122")
    private String phone;

    @Schema(description = "URL аватарки", example = "https://.../avatar.jpg")
    private String avatarUrl;

    @Schema(description = "Код роли пользователя (ATHLETE/COACH/ADMIN)", example = "ATHLETE")
    private String roleCode;

    @Schema(description = "Очки (кеш)", example = "120")
    private int points;

    @Schema(description = "Статус (кеш)", example = "Новичок")
    private String statusLabel;

    @Schema(description = "Стаж в месяцах (из profile.debutDate)", example = "7")
    private int tenureMonths;

    @Schema(description = "Посещено тренировок (из user_stats.trainings_attended_count)", example = "15", nullable = true)
    private Integer trainingsAttendedCount;

    @Schema(description = "Проведено боёв (из user_stats.fights_count)", example = "9", nullable = true)
    private Integer fightsCount;

    @Schema(description = "Победы (из user_stats.wins_count)", example = "5", nullable = true)
    private Integer winsCount;

    @Schema(description = "Проведено тренировок тренером (past sessions by coach_user_id)", example = "18", nullable = true)
    private Integer trainingsConductedCount;

    @Schema(description = "Количество учеников (в проекте пока нет модели связи тренер→ученики)", nullable = true)
    private Integer studentsCount;

    @Schema(description = "О себе", nullable = true)
    private String aboutMe;

    @Schema(description = "Количество поражений", nullable = true, example = "3")
    private Integer defeatsCount;

    @Schema(description = "Количество нокаутов", nullable = true, example = "2")
    private Integer knockoutsCount;

    @Schema(description = "Количество нокдаунов", nullable = true, example = "1")
    private Integer knockdownsCount;

    @Schema(description = "Является ли пользователь моим учеником", example = "false")
    private boolean myStudent;
}
