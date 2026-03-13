package com.round13.backend.module.info.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Событие клуба")
public class ClubEventResponse {

    @Schema(description = "ID события")
    private UUID id;

    @Schema(description = "Название")
    private String title;

    @Schema(description = "Описание")
    private String description;

    @Schema(description = "Тип события")
    private String type;

    @Schema(description = "Дата и время начала")
    private OffsetDateTime startsAt;

    @Schema(description = "Дата и время окончания")
    private OffsetDateTime endsAt;

    @Schema(description = "Место")
    private String location;

    @Schema(description = "ID автора события")
    private UUID createdByUserId;

    @Schema(description = "Участвует ли текущий пользователь")
    private boolean joinedByMe;

    @Schema(description = "Нужен ли групповой пакет для участия")
    private boolean requiresGroupPackage;

    @Schema(description = "Сколько групповых тренировок осталось у текущего пользователя", nullable = true)
    private Integer remainingGroupTrainings;
}
