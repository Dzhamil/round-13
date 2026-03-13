package com.round13.backend.module.training.controller;

import com.round13.backend.module.training.dto.MyScheduleItemResponse;
import com.round13.backend.module.training.service.MyScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Tag(name = "Account", description = "Операции с текущим пользователем")
@RestController
@RequestMapping(AccountScheduleController.BASE_PATH)
@RequiredArgsConstructor
public class AccountScheduleController {

    public static final String BASE_PATH = "/api/account";

    private final MyScheduleService myScheduleService;

    @Operation(
            summary = "Моё расписание: тренировки, которые я посещаю",
            description = "Возвращает список тренировок, на которые пользователь записан. " +
                    "Можно ограничить диапазоном дат (from/to)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Список тренировок пользователя"),
            @ApiResponse(responseCode = "400", description = "Некорректные параметры запроса"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @GetMapping("/schedule")
    public List<MyScheduleItemResponse> mySchedule(
            Authentication authentication,

            @Parameter(description = "Начало диапазона (включительно, ISO-8601)", example = "2026-02-01T00:00:00+03:00")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime from,

            @Parameter(description = "Конец диапазона (исключительно, ISO-8601)", example = "2026-03-01T00:00:00+03:00")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime to
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        return myScheduleService.getMySchedule(userId, from, to);
    }

    @Operation(
            summary = "Запросить отмену записи на тренировку",
            description = "Переводит запись пользователя в статус CANCEL_REQUESTED и фиксирует время запроса отмены."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Запрос на отмену отправлен"),
            @ApiResponse(responseCode = "400", description = "Некорректный запрос или тренировка уже началась"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Запись на тренировку не найдена")
    })
    @PostMapping("/schedule/{sessionId}/cancel-request")
    public void requestCancellation(
            Authentication authentication,
            @Parameter(description = "ID тренировки", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID sessionId
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        myScheduleService.requestCancellation(userId, sessionId);
    }
}
