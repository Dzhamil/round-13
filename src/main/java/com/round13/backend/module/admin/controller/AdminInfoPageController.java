package com.round13.backend.module.admin.controller;

import com.round13.backend.module.info.dto.UpsertInfoPageRequest;
import com.round13.backend.module.admin.service.AdminInfoPageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin Pages", description = "Администрирование информационных страниц")
@RestController
@RequestMapping(AdminInfoPageController.BASE_PATH)
@RequiredArgsConstructor
public class AdminInfoPageController {

    public static final String BASE_PATH = "/api/admin/pages";

    private final AdminInfoPageService adminInfoPageService;

    @Operation(summary = "Создать/обновить информационную страницу по коду")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Страница сохранена"),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён")
    })
    @PutMapping("/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void upsert(
            @Parameter(description = "Код страницы (например: about)", example = "about")
            @PathVariable("code") String code,
            @Valid @RequestBody UpsertInfoPageRequest request
    ) {
        adminInfoPageService.upsert(code, request);
    }
}
