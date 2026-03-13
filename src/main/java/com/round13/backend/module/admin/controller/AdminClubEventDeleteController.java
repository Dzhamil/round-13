package com.round13.backend.module.admin.controller;

import com.round13.backend.module.admin.service.AdminClubEventDeleteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Admin Club Events", description = "Управление событиями клуба")
@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
public class AdminClubEventDeleteController {

    private final AdminClubEventDeleteService adminClubEventDeleteService;

    @Operation(summary = "Удалить событие клуба")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        adminClubEventDeleteService.delete(id);
    }
}
