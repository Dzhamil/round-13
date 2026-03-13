package com.round13.backend.module.adminpanel.controller;

import com.round13.backend.module.adminpanel.service.PanelInfoPageService;
import com.round13.backend.module.info.dto.InfoPageResponse;
import com.round13.backend.module.info.dto.UpsertInfoPageRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin Panel Pages", description = "Информационные страницы в админ-панели")
@RestController
@RequestMapping(PanelInfoPageController.BASE_PATH)
@RequiredArgsConstructor
public class PanelInfoPageController {

    public static final String BASE_PATH = "/api/panel/content/pages";

    private final PanelInfoPageService panelInfoPageService;

    @Operation(summary = "Получить страницу для редактирования в админ-панели")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Страница получена"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён")
    })
    @GetMapping("/{code}")
    public InfoPageResponse getByCode(
            @Parameter(description = "Код страницы", example = "about")
            @PathVariable("code") String code
    ) {
        return panelInfoPageService.getByCode(code);
    }

    @Operation(summary = "Создать или обновить страницу в админ-панели")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Страница сохранена"),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён")
    })
    @PutMapping("/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void upsert(
            @Parameter(description = "Код страницы", example = "contacts")
            @PathVariable("code") String code,
            @Valid @RequestBody UpsertInfoPageRequest request
    ) {
        panelInfoPageService.upsert(code, request);
    }
}
