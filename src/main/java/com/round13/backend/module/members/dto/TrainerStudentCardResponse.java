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
@Schema(description = "Операционный блок карточки ученика для тренера")
public class TrainerStudentCardResponse {

    @Schema(description = "Статус ученика для тренера", nullable = true)
    private StudentOperationalStatusResponse operationalStatus;

    @Schema(description = "Приватная заметка тренера", nullable = true)
    private TrainerStudentNoteResponse trainerNote;

    @Schema(description = "Ближайшая тренировка ученика у этого тренера", nullable = true)
    private StudentTrainingActivityResponse nextTraining;

    @Schema(description = "Последние тренировки ученика у этого тренера")
    private List<StudentTrainingActivityResponse> recentTrainings;

    @Schema(description = "Последние изменения баланса ученика у этого тренера")
    private List<TrainingBalanceHistoryItemResponse> recentBalanceChanges;
}
