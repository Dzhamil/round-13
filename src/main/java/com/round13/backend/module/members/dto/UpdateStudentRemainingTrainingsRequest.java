package com.round13.backend.module.members.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Обновление остатка тренировок ученика у тренера")
public class UpdateStudentRemainingTrainingsRequest {

    @NotNull
    @Min(0)
    @Schema(description = "Новый остаток тренировок", example = "8", minimum = "0", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer remainingTrainings;
}
