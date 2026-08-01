package com.round13.backend.module.loyalty.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.Map;

public record PointRevokeRequest(
        OffsetDateTime eventDate,
        @NotBlank @Size(max = 512) String reason,
        Map<String, Object> metadata
) {
}
