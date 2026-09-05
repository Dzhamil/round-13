package com.round13.backend.module.schedule2.dto;

import com.round13.backend.domain.AttendanceStatus;
import com.round13.backend.domain.TrainingType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public final class Schedule2Dtos {
    private Schedule2Dtos() {}
    public record TrainingSummary(UUID id, String title, TrainingType type, OffsetDateTime startTime,
                                  OffsetDateTime endTime, String timezone, String location,
                                  UUID trainerId, String trainerName, int participantsCount, long version) {}
    public record Participant(UUID participationId, UUID studentId, String studentName,
                              AttendanceStatus attendanceStatus, String comment, long version) {}
    public record TrainingDetail(TrainingSummary training, List<Participant> participants) {}
    public record AttendanceItem(@NotNull UUID participationId, @NotNull AttendanceStatus status,
                                 @Size(max=500) String comment, @PositiveOrZero long version) {}
    public record AttendanceRequest(@NotEmpty List<@Valid AttendanceItem> participants) {}
    public record CreateTrainingRequest(@NotBlank @Size(max=256) String title, @NotNull TrainingType type,
                                        @NotNull OffsetDateTime startTime, @Min(1) @Max(1440) int durationMinutes,
                                        @Size(max=256) String location, @Size(max=64) String timezone,
                                        @NotEmpty List<UUID> studentIds) {}
}
