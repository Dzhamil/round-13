package com.round13.backend.module.training.controller;

import com.round13.backend.module.training.dto.CreatePersonalTrainingRequest;
import com.round13.backend.module.training.dto.TrainerScheduleItemResponse;
import com.round13.backend.module.training.service.TrainerScheduleService;
import io.swagger.v3.oas.annotations.Operation;
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
}