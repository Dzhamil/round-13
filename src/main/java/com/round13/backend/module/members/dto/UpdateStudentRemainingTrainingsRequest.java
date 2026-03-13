package com.round13.backend.module.members.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Обновление остатка тренировок ученика у тренера")
public class UpdateStudentRemainingTrainingsRequest {

    @Schema(description = "Новый остаток тренировок", example = "8")
    private Integer remainingTrainings;
}
