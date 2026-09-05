package com.round13.backend.module.verification.dto;

import com.round13.backend.domain.VerificationStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public final class VerificationDtos {
    private VerificationDtos() {}

    public record TrainerOption(UUID id, String name) {}
    public record Selection(@NotNull UUID trainerId, @NotEmpty Set<String> trainingTypes) {}
    public record SubmitRequest(@NotEmpty List<@Valid Selection> trainers) {}
    public record ReviewRequest(boolean dataConfirmed, boolean relationshipConfirmed) {}
    public record RequestResponse(UUID id, UUID studentId, String studentName, UUID trainerId,
                                  String trainerName, Set<String> trainingTypes, VerificationStatus status,
                                  boolean dataConfirmed, boolean relationshipConfirmed,
                                  OffsetDateTime createdAt, OffsetDateTime reviewedAt) {}
}
