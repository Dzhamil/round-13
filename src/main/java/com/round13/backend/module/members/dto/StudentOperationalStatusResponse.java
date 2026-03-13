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
@Schema(description = "Операционный статус ученика")
public class StudentOperationalStatusResponse {

    @Schema(description = "Код статуса", example = "ACTIVE")
    private StudentOperationalStatusCode code;

    @Schema(description = "Дата последнего подтвержденного посещения", nullable = true)
    private OffsetDateTime lastAttendedAt;
}
