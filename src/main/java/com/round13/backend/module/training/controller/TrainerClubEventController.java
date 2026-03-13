package com.round13.backend.module.training.controller;

import com.round13.backend.module.training.dto.CreateCoachTrainingEventRequest;
import com.round13.backend.module.training.service.TrainerClubEventService;
import com.round13.backend.security.AuthenticationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
        return trainerClubEventService.create(AuthenticationUtils.getUserId(authentication), request);
    }

    @Operation(summary = "Обновить тренировку в афише")
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody CreateCoachTrainingEventRequest request
    ) {
        trainerClubEventService.update(AuthenticationUtils.getUserId(authentication), id, request);
    }

    @Operation(summary = "Удалить тренировку из афиши")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            Authentication authentication,
            @PathVariable UUID id
    ) {
        trainerClubEventService.delete(AuthenticationUtils.getUserId(authentication), id);
    }
}
