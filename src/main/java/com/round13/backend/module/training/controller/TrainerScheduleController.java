package com.round13.backend.module.training.controller;

import com.round13.backend.module.training.dto.CreatePersonalTrainingRequest;
import com.round13.backend.module.training.dto.TrainerScheduleItemResponse;
import com.round13.backend.module.training.service.TrainerScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Tag(name = "TrainerSchedule")
@RestController
@RequestMapping("/api/trainer")
@RequiredArgsConstructor
public class TrainerScheduleController {

    private final TrainerScheduleService trainerScheduleService;

    @Operation(summary = "Расписание тренера")
    @GetMapping("/schedule")
    public List<TrainerScheduleItemResponse> getSchedule(
            Authentication authentication,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime to
    ) {
        UUID coachId = UUID.fromString(authentication.getName());
        return trainerScheduleService.getTrainerSchedule(coachId, from, to);
    }

    @Operation(summary = "Создать персональную тренировку")
    @PostMapping("/personal-trainings")
    public UUID createPersonalTraining(
            Authentication authentication,
            @Valid @RequestBody CreatePersonalTrainingRequest request
    ) {
        UUID coachId = UUID.fromString(authentication.getName());
        return trainerScheduleService.createPersonalTraining(coachId, request);
    }

    @Operation(summary = "Подтвердить запрос ученика на отмену тренировки")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Запрос на отмену подтверждён"),
            @ApiResponse(responseCode = "400", description = "Некорректный статус или тренировка уже началась"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Запись на тренировку не найдена")
    })
    @PostMapping("/schedule/{sessionId}/confirm-cancellation")
    public void confirmCancellation(
            Authentication authentication,
            @Parameter(description = "ID тренировки", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID sessionId
    ) {
        UUID coachId = UUID.fromString(authentication.getName());
        trainerScheduleService.confirmCancellation(coachId, sessionId);
    }

    @Operation(summary = "Отметить посещение персональной тренировки")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Посещение отмечено"),
            @ApiResponse(responseCode = "400", description = "Некорректный статус или тренировка ещё не началась"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Запись на тренировку не найдена")
    })
    @PostMapping("/schedule/{sessionId}/mark-attended")
    public void markAttended(
            Authentication authentication,
            @Parameter(description = "ID тренировки", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID sessionId
    ) {
        UUID coachId = UUID.fromString(authentication.getName());
        trainerScheduleService.markAttended(coachId, sessionId);
    }

    @Operation(summary = "Отметить неявку ученика на персональную тренировку")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Неявка отмечена"),
            @ApiResponse(responseCode = "400", description = "Некорректный статус или тренировка ещё не началась"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Запись на тренировку не найдена")
    })
    @PostMapping("/schedule/{sessionId}/mark-no-show")
    public void markNoShow(
            Authentication authentication,
            @Parameter(description = "ID тренировки", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID sessionId
    ) {
        UUID coachId = UUID.fromString(authentication.getName());
        trainerScheduleService.markNoShow(coachId, sessionId);
    }

    @Operation(summary = "Отменить тренировку тренером без списания лимита ученика")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Тренировка отменена тренером"),
            @ApiResponse(responseCode = "400", description = "Некорректный статус или тренировка уже началась"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Запись на тренировку не найдена")
    })
    @PostMapping("/schedule/{sessionId}/cancel-by-trainer")
    public void cancelByTrainer(
            Authentication authentication,
            @Parameter(description = "ID тренировки", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID sessionId
    ) {
        UUID coachId = UUID.fromString(authentication.getName());
        trainerScheduleService.cancelByTrainer(coachId, sessionId);
    }
}
