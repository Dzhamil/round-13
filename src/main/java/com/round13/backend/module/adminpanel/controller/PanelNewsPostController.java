package com.round13.backend.module.adminpanel.controller;

import com.round13.backend.module.adminpanel.service.PanelNewsPostService;
import com.round13.backend.module.news.dto.AdminNewsPostResponse;
import com.round13.backend.module.news.dto.UpsertNewsPostRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Admin Panel News", description = "Новости клуба в админ-панели")
@RestController
@RequestMapping(PanelNewsPostController.BASE_PATH)
@RequiredArgsConstructor
public class PanelNewsPostController {

    public static final String BASE_PATH = "/api/panel/content/news";

    private final PanelNewsPostService panelNewsPostService;

    @Operation(summary = "Получить список новостей для редактирования")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Новости получены"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён")
    })
    @GetMapping
    public List<AdminNewsPostResponse> getNews() {
        return panelNewsPostService.getAll();
    }

    @Operation(summary = "Получить новость по id")
    @GetMapping("/{id}")
    public AdminNewsPostResponse getById(@PathVariable UUID id) {
        return panelNewsPostService.getById(id);
    }

    @Operation(summary = "Создать новость")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Новость создана"),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UUID create(@Valid @RequestBody UpsertNewsPostRequest request) {
        return panelNewsPostService.create(request);
    }

    @Operation(summary = "Обновить новость")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Новость обновлена"),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён"),
            @ApiResponse(responseCode = "404", description = "Новость не найдена")
    })
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(@PathVariable UUID id, @Valid @RequestBody UpsertNewsPostRequest request) {
        panelNewsPostService.update(id, request);
    }

    @Operation(summary = "Удалить новость")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Новость удалена"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён"),
            @ApiResponse(responseCode = "404", description = "Новость не найдена")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        panelNewsPostService.delete(id);
    }
}
