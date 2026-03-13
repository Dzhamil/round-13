package com.round13.backend.module.shop.controller;

import com.round13.backend.module.shop.dto.CreateShopOrderRequest;
import com.round13.backend.module.shop.dto.ShopOrderListItemResponse;
import com.round13.backend.module.shop.service.ShopOrderService;
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

@Tag(name = "Shop Orders", description = "Заказы магазина")
@RestController
@RequestMapping("/api/shop/orders")
@RequiredArgsConstructor
public class ShopOrderController {

    private final ShopOrderService shopOrderService;

    @Operation(summary = "Создать заказ в магазине")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Заказ создан"),
            @ApiResponse(responseCode = "400", description = "Некорректный запрос"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UUID create(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody CreateShopOrderRequest request
    ) {
        return shopOrderService.createOrder(userId, request);
    }

    @Operation(summary = "История заказов пользователя")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Список заказов"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @GetMapping
    public List<ShopOrderListItemResponse> myOrders(
            @RequestAttribute("userId") UUID userId
    ) {
        return shopOrderService.getMyOrders(userId);
    }
}
