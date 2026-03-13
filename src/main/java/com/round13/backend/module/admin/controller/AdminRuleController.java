package com.round13.backend.module.admin.controller;

import com.round13.backend.module.admin.dto.AdminRuleResponse;
import com.round13.backend.module.admin.dto.UpsertRuleRequest;
import com.round13.backend.module.admin.service.AdminRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Администрирование правил клуба.
 */
@Tag(name = "Admin Rules", description = "Управление правилами клуба")
@RestController
@RequestMapping(AdminRuleController.BASE_PATH)
@RequiredArgsConstructor
public class AdminRuleController {

    public static final String BASE_PATH = "/api/admin/rules";

    private final AdminRuleService adminRuleService;

    @Operation(summary = "Получить список правил")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Список правил успешно получен"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён"),
            @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    @GetMapping
    public List<AdminRuleResponse> getRules() {
        return adminRuleService.getRules();
    }

    @Operation(summary = "Получить правило по id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Правило успешно получено"),
            @ApiResponse(responseCode = "400", description = "Некорректный id"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён"),
            @ApiResponse(responseCode = "404", description = "Правило не найдено"),
            @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    @GetMapping("/{id}")
    public AdminRuleResponse getRule(@PathVariable UUID id) {
        return adminRuleService.getRule(id);
    }

    @Operation(summary = "Создать правило")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Правило создано"),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён"),
            @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UUID create(@Valid @RequestBody UpsertRuleRequest request) {
        return adminRuleService.create(request);
    }

    @Operation(summary = "Обновить правило")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Правило обновлено"),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации / некорректный id"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён"),
            @ApiResponse(responseCode = "404", description = "Правило не найдено"),
            @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(@PathVariable UUID id, @Valid @RequestBody UpsertRuleRequest request) {
        adminRuleService.update(id, request);
    }

    @Operation(summary = "Удалить правило")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Правило удалено"),
            @ApiResponse(responseCode = "400", description = "Некорректный id"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён"),
            @ApiResponse(responseCode = "404", description = "Правило не найдено"),
            @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        adminRuleService.delete(id);
    }
}
