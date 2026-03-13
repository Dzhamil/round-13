package com.round13.backend.module.info.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Создание события клуба")
public class CreateClubEventRequest {

    @NotBlank
    @Size(max = 256)
    private String title;

    @Size(max = 5000)
    private String description;

    @NotBlank
    @Size(max = 32)
    private String type;

    @NotNull
    @Future
    private OffsetDateTime startsAt;

    @NotNull
    @Future
    private OffsetDateTime endsAt;

    @Size(max = 256)
    private String location;
}
