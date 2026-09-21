package com.round13.backend.module.schedule2.dto;

import com.round13.backend.domain.TrainingType;
import java.time.OffsetDateTime;
import java.util.UUID;

public final class Schedule2Dtos {
    private Schedule2Dtos() {}

    public record TrainingSummary(UUID id, String title, TrainingType type, OffsetDateTime startTime,
                                  OffsetDateTime endTime, String timezone, String location,
                                  UUID trainerId, String trainerName, int participantsCount, long version) {}
}
