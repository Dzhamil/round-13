package com.round13.backend.module.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Статистика текущего пользователя")
public class MyStatsResponse {

    @Schema(description = "Место в рейтинге", nullable = true, example = "5")
    private Integer ratingPlace;

    @Schema(description = "Стаж в клубе в месяцах", example = "14")
    private int clubExperienceMonths;

    @Schema(description = "Количество боёв", example = "12")
    private int fightsCount;

    @Schema(description = "Количество побед", example = "8")
    private int winsCount;

    @Schema(description = "Количество поражений", example = "4")
    private int defeatsCount;

    @Schema(description = "Количество спаррингов", example = "12")
    private int sparringsCount;

    @Schema(description = "Количество посещённых тренировок", example = "20")
    private int trainingsAttendedCount;

    @Schema(description = "Количество пропущенных тренировок", example = "3")
    private int trainingsMissedCount;

    @Schema(description = "Процент побед", example = "67")
    private int winRatePercent;

    @Schema(description = "Процент нокаутов", example = "25")
    private int knockoutRatePercent;

    @Schema(description = "Процент нокдаунов", example = "33")
    private int knockdownRatePercent;
}
