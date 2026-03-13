package com.round13.backend.module.shop.controller;

import com.round13.backend.module.shop.dto.PurchaseRequestDto;
import com.round13.backend.module.shop.dto.UpdateShopOrderStatusRequest;
import com.round13.backend.module.shop.service.AdminShopOrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/pending")
    public List<PurchaseRequestDto> pending() {
        return service.getPendingOrders();
    }

    @GetMapping("/history")
    public List<PurchaseRequestDto> history() {
        return service.getProcessedOrders();
    }

    @PatchMapping("/{id}/status")
    public void updateStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateShopOrderStatusRequest request
    ) {
        service.updateStatus(id, request.status());
    }
}
