package com.round13.backend.module.shop.controller;

import com.round13.backend.module.shop.dto.ShopCatalogItemResponse;
import com.round13.backend.module.shop.dto.UpsertShopProductRequest;
import com.round13.backend.module.shop.service.AdminShopProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Админ-контроллер управления товарами магазина.
 */
@Tag(name = "Admin Shop Products", description = "Управление товарами магазина")
@RestController
@RequestMapping("/api/admin/shop/products")
@RequiredArgsConstructor
public class AdminShopProductController {

    private final AdminShopProductService service;

    /**
     * Создать товар.
     */
    @Operation(summary = "Создать товар")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Товар создан"),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён"),
            @ApiResponse(responseCode = "404", description = "Категория не найдена"),
            @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShopCatalogItemResponse create(@Valid @RequestBody UpsertShopProductRequest request) {
        return service.create(request);
    }

    @Operation(summary = "Обновить товар")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Товар обновлён"),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён"),
            @ApiResponse(responseCode = "404", description = "Товар или категория не найдены"),
            @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    @PutMapping("/{id}")
    public ShopCatalogItemResponse update(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpsertShopProductRequest request
    ) {
        return service.update(id, request);
    }

    @Operation(summary = "Удалить товар")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Товар удалён"),
            @ApiResponse(responseCode = "400", description = "Некорректный id"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещён"),
            @ApiResponse(responseCode = "404", description = "Товар не найден"),
            @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") UUID id) {
        service.delete(id);
    }
}
