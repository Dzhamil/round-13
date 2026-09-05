package com.round13.backend.module.sheets.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;
import java.time.OffsetDateTime;
import java.util.List;
import com.round13.backend.domain.TrainingType;

public final class GoogleSheetDtos {
    private GoogleSheetDtos() {}
    public record SpaceRequest(@NotBlank @Size(max=160) String displayName,
                               @NotBlank String spreadsheetUrl,
                               @NotBlank @Size(max=160) String spreadsheetId,
                               @Size(max=320) String serviceAccountEmail,
                               @Pattern(regexp="^[A-Z_][A-Z0-9_]*$", message="Некорректное имя переменной окружения") String credentialsEnvVar,
                               @Size(max=2000) String accessDetails, boolean active) {}
    public record SpaceResponse(UUID id, String displayName, String spreadsheetUrl, String spreadsheetId,
                                String serviceAccountEmail, String credentialsEnvVar, String accessDetails,
                                boolean active, boolean credentialsAvailable) {}
    public record AccessTestResponse(boolean success, String message) {}
    public record SheetTraining(String trainerName, String sheetName, String title, TrainingType type,
                                String sourceType, OffsetDateTime startTime, String schedule, int durationMinutes,
                                String location, boolean active) {}
    public record SyncResponse(int trainersRead, int participantsRead, int usersUpdated,
                               int usersNotFound, List<SheetTraining> trainings) {}
}
