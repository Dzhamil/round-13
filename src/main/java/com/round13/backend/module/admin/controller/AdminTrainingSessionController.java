package com.round13.backend.module.admin.controller;

import com.round13.backend.module.admin.dto.UpsertTrainingSessionRequest;
import com.round13.backend.module.admin.service.AdminTrainingSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Администрирование расписания тренировок.
 */
@Tag(name = "Admin Training Sessions", description = "Управление расписанием тренировок")
@RestController
@RequestMapping(AdminTrainingSessionController.BASE_PATH)
@RequiredArgsConstructor
public class AdminTrainingSessionController {

    public static final String BASE_PATH = "/api/admin/training-sessions";

    private final AdminTrainingSessionService adminTrainingSessionService;

    @Operation(summary = "Создать тренировку")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UUID create(@Valid @RequestBody UpsertTrainingSessionRequest request) {
        return adminTrainingSessionService.create(request);
    }

    @Operation(summary = "Обновить тренировку")
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(@PathVariable UUID id, @Valid @RequestBody UpsertTrainingSessionRequest request) {
        adminTrainingSessionService.update(id, request);
    }

    @Operation(summary = "Удалить тренировку")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        adminTrainingSessionService.delete(id);
    }
}
