package com.round13.backend.module.training.controller;

import com.round13.backend.module.training.dto.CreateCoachTrainingEventRequest;
import com.round13.backend.module.training.service.TrainerClubEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Trainer Club Events")
@RestController
@RequestMapping("/api/trainer/events")
@RequiredArgsConstructor
public class TrainerClubEventController {

    private final TrainerClubEventService trainerClubEventService;

    @Operation(summary = "Создать тренировку для афиши")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UUID create(
            Authentication authentication,
            @Valid @RequestBody CreateCoachTrainingEventRequest request
    ) {
        UUID coachId = UUID.fromString(authentication.getName());
        return trainerClubEventService.create(coachId, request);
    }

    @Operation(summary = "Удалить тренировку из афиши")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            Authentication authentication,
            @PathVariable UUID id
    ) {
        UUID coachId = UUID.fromString(authentication.getName());
        trainerClubEventService.delete(coachId, id);
    }
}
