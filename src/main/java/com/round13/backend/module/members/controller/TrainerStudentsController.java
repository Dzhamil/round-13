package com.round13.backend.module.members.controller;

import com.round13.backend.module.members.dto.TrainerStudentHistoryResponse;
import com.round13.backend.module.members.dto.TrainerStudentNoteResponse;
import com.round13.backend.module.members.dto.UpdateStudentCoachNoteRequest;
import com.round13.backend.module.members.dto.UpdateStudentRemainingTrainingsRequest;
import com.round13.backend.module.members.dto.TrainingBalanceHistoryResponse;
import com.round13.backend.module.members.service.TrainerStudentHistoryService;
import com.round13.backend.module.members.service.TrainerStudentNoteService;
import com.round13.backend.module.members.service.TrainingBalanceHistoryService;
import com.round13.backend.module.members.service.TrainerStudentsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/trainer/students")
@RequiredArgsConstructor
@Tag(name = "Trainer Students", description = "Управление списком учеников тренера и их остатком тренировок")
public class TrainerStudentsController {

    private final TrainerStudentsService service;
    private final TrainingBalanceHistoryService trainingBalanceHistoryService;
    private final TrainerStudentNoteService trainerStudentNoteService;
    private final TrainerStudentHistoryService trainerStudentHistoryService;

    @Operation(summary = "Добавить ученика тренеру")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ученик добавлен"),
            @ApiResponse(responseCode = "400", description = "Некорректный запрос"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    @PostMapping("/{studentId}")
    public void addStudent(
            Authentication authentication,
            @Parameter(description = "ID ученика", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID studentId
    ) {
        UUID trainerId = UUID.fromString(authentication.getName());
        service.addStudent(trainerId, studentId);
    }

    @Operation(summary = "Удалить ученика из списка тренера")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ученик удалён"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @DeleteMapping("/{studentId}")
    public void removeStudent(
            Authentication authentication,
            @Parameter(description = "ID ученика", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID studentId
    ) {
        UUID trainerId = UUID.fromString(authentication.getName());
        service.removeStudent(trainerId, studentId);
    }

    @Operation(summary = "Получить историю изменений баланса тренировок")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "История получена"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @GetMapping("/history")
    public TrainingBalanceHistoryResponse getHistory(Authentication authentication) {
        UUID trainerId = UUID.fromString(authentication.getName());
        return trainingBalanceHistoryService.getHistory(trainerId);
    }

    @Operation(summary = "Получить полную историю по конкретному ученику")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "История ученика получена"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "400", description = "Ученик не принадлежит тренеру")
    })
    @GetMapping("/{studentId}/history")
    public TrainerStudentHistoryResponse getStudentHistory(
            Authentication authentication,
            @Parameter(description = "ID ученика", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID studentId
    ) {
        UUID trainerId = UUID.fromString(authentication.getName());
        return trainerStudentHistoryService.getHistory(trainerId, studentId);
    }

    @Operation(summary = "Обновить остаток тренировок ученика")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Остаток тренировок обновлён"),
            @ApiResponse(responseCode = "400", description = "Некорректный запрос"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @PatchMapping("/{studentId}/remaining-trainings")
    public void updateRemainingTrainings(
            Authentication authentication,
            @Parameter(description = "ID ученика", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID studentId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Новое значение остатка тренировок",
                    content = @Content(schema = @Schema(implementation = UpdateStudentRemainingTrainingsRequest.class))
            )
            @Valid @RequestBody UpdateStudentRemainingTrainingsRequest request
    ) {
        UUID trainerId = UUID.fromString(authentication.getName());
        service.updateRemainingTrainings(trainerId, studentId, request.getRemainingTrainings());
    }

    @Operation(summary = "Обновить приватную заметку тренера по ученику")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Заметка обновлена"),
            @ApiResponse(responseCode = "400", description = "Некорректный запрос"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @PatchMapping("/{studentId}/coach-note")
    public TrainerStudentNoteResponse updateCoachNote(
            Authentication authentication,
            @Parameter(description = "ID ученика", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID studentId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Приватная заметка тренера",
                    content = @Content(schema = @Schema(implementation = UpdateStudentCoachNoteRequest.class))
            )
            @Valid @RequestBody UpdateStudentCoachNoteRequest request
    ) {
        UUID trainerId = UUID.fromString(authentication.getName());
        return trainerStudentNoteService.updateCoachNote(trainerId, studentId, request.getNote(), trainerId);
    }

}
