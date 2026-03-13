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
@Schema(description = "Журнал изменений баланса тренировок")
public class TrainingBalanceHistoryResponse {

    @Schema(description = "Список событий")
    private List<TrainingBalanceHistoryItemResponse> items;
}
