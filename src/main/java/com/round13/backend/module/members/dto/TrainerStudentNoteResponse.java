package com.round13.backend.module.members.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Приватная заметка тренера по ученику")
public class TrainerStudentNoteResponse {

    @Schema(description = "Текст заметки", nullable = true)
    private String note;

    @Schema(description = "Когда заметка была обновлена", nullable = true)
    private OffsetDateTime updatedAt;

    @Schema(description = "ID пользователя, который обновил заметку", nullable = true)
    private String updatedByUserId;

    @Schema(description = "Кто обновил заметку", nullable = true)
    private String updatedByName;
}
