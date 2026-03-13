package com.round13.backend.module.admin.controller;

import com.round13.backend.domain.UserStatsEntity;
import com.round13.backend.module.admin.dto.AdminUpdateStatsRequest;
import com.round13.backend.module.admin.service.AdminUserStatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Админский контроллер для редактирования статистики пользователей.
 */
@Tag(name = "Admin Stats", description = "Администрирование статистики пользователей")
@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminUserStatsController {

    private final AdminUserStatsService statsService;

    /**
     * Обновить статистику пользователя (ADMIN или COACH).
     */
    @PreAuthorize("hasAnyRole('ADMIN','COACH')")
    @Operation(summary = "Редактировать статистику пользователя")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Статистика обновлена"),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации"),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @PatchMapping
    @ResponseStatus(HttpStatus.OK)
    public UserStatsEntity updateStats(@Valid @RequestBody AdminUpdateStatsRequest request) {
        return statsService.updateStats(request);
    }
}
