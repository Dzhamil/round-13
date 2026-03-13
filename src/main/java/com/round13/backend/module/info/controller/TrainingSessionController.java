package com.round13.backend.module.info.controller;

import com.round13.backend.module.info.dto.TrainingSessionResponse;
import com.round13.backend.module.info.service.TrainingSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Публичный контроллер расписания тренировок (афиша).
 */
@Tag(name = "Training Sessions", description = "Расписание тренировок и запись")
@RestController
@RequestMapping(TrainingSessionController.BASE_PATH)
@RequiredArgsConstructor
public class TrainingSessionController {

    public static final String BASE_PATH = "/api/training-sessions";

    private final TrainingSessionService trainingSessionService;

    @Operation(summary = "Получить список тренировок по фильтрам")
    @GetMapping
    public List<TrainingSessionResponse> getSessions(
            @Parameter(description = "Тип тренировки: GROUP/PERSONAL/OPEN")
            @RequestParam(required = false) String type,

            @Parameter(description = "ID тренера/организатора")
            @RequestParam(required = false) UUID coachId,

            @Parameter(description = "Начало диапазона (включительно, ISO-8601)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime from,

            @Parameter(description = "Конец диапазона (исключительно, ISO-8601)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime to
    ) {
        return trainingSessionService.getSessions(type, coachId, from, to);
    }

    @Operation(summary = "Получить карточку тренировки по id")
    @GetMapping("/{id}")
    public TrainingSessionResponse getById(
            @Parameter(description = "ID тренировки") @PathVariable UUID id
    ) {
        return trainingSessionService.getById(id);
    }

    @Operation(summary = "Записаться на тренировку")
    @PostMapping("/{id}/join")
    public void join(
            @Parameter(hidden = true) Authentication authentication,
            @Parameter(description = "ID тренировки") @PathVariable UUID id
    ) {
        UUID userId = (UUID) authentication.getPrincipal();
        trainingSessionService.join(userId, id);
    }

    @Operation(summary = "Отменить запись на тренировку")
    @PostMapping("/{id}/cancel")
    public void cancel(
            @Parameter(hidden = true) Authentication authentication,
            @Parameter(description = "ID тренировки") @PathVariable UUID id
    ) {
        UUID userId = (UUID) authentication.getPrincipal();
        trainingSessionService.cancel(userId, id);
    }
}
