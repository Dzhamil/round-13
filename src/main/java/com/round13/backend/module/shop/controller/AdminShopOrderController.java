package com.round13.backend.module.shop.controller;

import com.round13.backend.module.shop.dto.PurchaseRequestDto;
import com.round13.backend.module.shop.dto.UpdateShopOrderStatusRequest;
import com.round13.backend.module.shop.service.AdminShopOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.UUID;

/**
 * Контроллер админ‑заявок на покупки.
 */
@Tag(name = "Admin Shop Orders")
@RestController
@RequestMapping("/api/admin/shop/orders")
@RequiredArgsConstructor
public class AdminShopOrderController {

    private final AdminShopOrderService service;

    @Operation(summary = "Получить ожидающие подтверждения заказы")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Список ожидающих заказов"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещен")
    })
    @GetMapping("/pending")
    public List<PurchaseRequestDto> pending() {
        return service.getPendingOrders();
    }

    @Operation(summary = "Получить историю обработанных заказов")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "История заказов"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещен")
    })
    @GetMapping("/history")
    public List<PurchaseRequestDto> history() {
        return service.getProcessedOrders();
    }

    @Operation(summary = "Обновить статус заказа")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Статус заказа обновлен"),
            @ApiResponse(responseCode = "400", description = "Некорректный статус или состояние заказа"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещен"),
            @ApiResponse(responseCode = "404", description = "Заказ не найден")
    })
    @PatchMapping("/{id}/status")
    public void updateStatus(
            Authentication authentication,
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateShopOrderStatusRequest request
    ) {
        UUID updatedByUserId = UUID.fromString(authentication.getName());
        service.updateStatus(id, request.status(), updatedByUserId);
    }
}
