package com.round13.backend.module.members.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Полная история по ученику в контуре тренера")
public class TrainerStudentHistoryResponse {

    @Schema(description = "История тренировок ученика у тренера")
    private List<StudentTrainingActivityResponse> trainings;

    @Schema(description = "История изменений баланса ученика у тренера")
    private List<TrainingBalanceHistoryItemResponse> balanceChanges;
}
