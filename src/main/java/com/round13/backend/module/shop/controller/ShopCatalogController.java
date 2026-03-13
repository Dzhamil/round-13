package com.round13.backend.module.shop.controller;

import com.round13.backend.module.shop.dto.ShopCatalogItemResponse;
import com.round13.backend.module.shop.dto.ShopCategoryResponse;
import com.round13.backend.module.shop.service.ShopCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Публичный каталог магазина. Возвращает список категорий и товаров для витрины.
 * Эти эндпойнты не требуют аутентификации и возвращают только активные сущности.
 */
@Tag(name = "Shop Catalog", description = "Публичный каталог магазина")
@RestController
@RequestMapping("/api/shop")
@RequiredArgsConstructor
public class ShopCatalogController {

    private final ShopCatalogService shopCatalogService;

    /**
     * Получить список активных категорий.
     */
    @Operation(summary = "Список категорий магазина")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Список категорий")})
    @GetMapping("/categories")
    public List<ShopCategoryResponse> getCategories() {
        return shopCatalogService.getCategories();
    }

    /**
     * Получить список активных товаров определённой категории.
     * @param categoryId идентификатор категории
     */
    @Operation(summary = "Список товаров по категории")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Список товаров"),
            @ApiResponse(responseCode = "400", description = "Некорректный идентификатор категории")
    })
    @GetMapping("/categories/{categoryId}/products")
    public List<ShopCatalogItemResponse> getProductsByCategory(@PathVariable UUID categoryId) {
        return shopCatalogService.getProducts(categoryId);
    }

    /**
     * Получить список всех активных товаров.
     */
    @Operation(summary = "Список всех товаров")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Список товаров")})
    @GetMapping("/products")
    public List<ShopCatalogItemResponse> getProducts() {
        return shopCatalogService.getProducts(null);
    }

    /**
     * Получить карточку активного товара по коду.
     * @param code стабильный код товара
     */
    @Operation(summary = "Получить товар по коду")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Товар найден"),
            @ApiResponse(responseCode = "400", description = "Некорректный код"),
            @ApiResponse(responseCode = "404", description = "Товар не найден")
    })
    @GetMapping("/products/code/{code}")
    public ShopCatalogItemResponse getProductByCode(@PathVariable String code) {
        return shopCatalogService.getProductByCode(code);
    }
}
