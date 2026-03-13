package com.round13.backend.module.training.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Создание тренировочного события тренером")
public class CreateCoachTrainingEventRequest {

    @NotBlank
    @Size(max = 256)
    private String title;

    @Size(max = 5000)
    private String description;

    @NotNull
    @Future
    private OffsetDateTime startsAt;

    @NotNull
    @Future
    private OffsetDateTime endsAt;

    @Size(max = 256)
    private String location;

    @Schema(description = "ID тренера, который ведет групповую тренировку", nullable = true)
    private UUID trainerId;
}
