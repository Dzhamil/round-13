package com.round13.backend.module.members.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Обновление приватной заметки тренера по ученику")
public class UpdateStudentCoachNoteRequest {

    @Size(max = 2000)
    @Schema(description = "Текст приватной заметки. Пустая строка очищает заметку.", nullable = true)
    private String note;
}
