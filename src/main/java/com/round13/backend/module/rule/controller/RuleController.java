package com.round13.backend.module.rule.controller;

import com.round13.backend.module.rule.dto.RuleResponse;
import com.round13.backend.module.rule.service.RuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Rules", description = "Правила клуба")
@RestController
@RequestMapping(RuleController.BASE_PATH)
@RequiredArgsConstructor
public class RuleController {

    public static final String BASE_PATH = "/api/rules";

    private final RuleService ruleService;

    @Operation(summary = "Получить правила клуба")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Список правил успешно получен"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён"),
            @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<RuleResponse> getRules() {
        return ruleService.getRules();
    }
}
