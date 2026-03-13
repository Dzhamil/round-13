package com.round13.backend.module.stats.controller;

import com.round13.backend.module.stats.dto.MyStatsResponse;
import com.round13.backend.module.stats.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Stats", description = "Статистика текущего пользователя")
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @Operation(summary = "Получить статистику текущего пользователя")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Статистика пользователя"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    @GetMapping("/me")
    public MyStatsResponse getMe(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return statsService.getMyStats(userId);
    }
}
