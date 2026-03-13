package com.round13.backend.module.shop.controller;

import com.round13.backend.module.shop.dto.ShopCategoryResponse;
import com.round13.backend.module.shop.dto.UpsertShopCategoryRequest;
import com.round13.backend.module.shop.service.AdminShopCategoryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Админ-контроллер управления категориями магазина.
 */
@Tag(name = "Admin Shop Categories")
@RestController
@RequestMapping("/api/admin/shop/categories")
@RequiredArgsConstructor
public class AdminShopCategoryController {

    private final AdminShopCategoryService service;

    /**
     * Все категории (включая неактивные).
     */
    @GetMapping
    public List<ShopCategoryResponse> getAll() {
        return service.getAll();
    }

    /**
     * Создать категорию.
     */
    @PostMapping
    public ShopCategoryResponse create(@Valid @RequestBody UpsertShopCategoryRequest request) {
        return service.create(request);
    }

    /**
     * Обновить категорию.
     */
    @PutMapping("/{id}")
    public ShopCategoryResponse update(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpsertShopCategoryRequest request
    ) {
        return service.update(id, request);
    }

    /**
     * Удалить категорию.
     */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") UUID id) {
        service.delete(id);
    }
}
