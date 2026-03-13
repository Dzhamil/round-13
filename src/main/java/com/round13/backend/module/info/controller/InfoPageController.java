package com.round13.backend.module.info.controller;

import com.round13.backend.module.info.dto.InfoPageResponse;
import com.round13.backend.module.info.service.InfoPageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Pages", description = "Публичные информационные страницы (например, О нас)")
@RestController
@RequestMapping(InfoPageController.BASE_PATH)
@RequiredArgsConstructor
public class InfoPageController {

    public static final String BASE_PATH = "/api/pages";

    private final InfoPageService infoPageService;

    @Operation(summary = "Получить информационную страницу по коду")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Страница найдена"),
            @ApiResponse(responseCode = "404", description = "Страница не найдена")
    })
    @GetMapping("/{code}")
    public InfoPageResponse getByCode(
            @Parameter(description = "Код страницы (например: about)", example = "about")
            @PathVariable("code") String code
    ) {
        return infoPageService.getByCode(code);
    }
}
