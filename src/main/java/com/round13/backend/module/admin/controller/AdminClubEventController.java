package com.round13.backend.module.admin.controller;

import com.round13.backend.module.admin.service.AdminClubEventService;
import com.round13.backend.module.info.dto.CreateClubEventRequest;
import com.round13.backend.security.AuthenticationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Admin Club Events", description = "Управление событиями клуба")
@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
public class AdminClubEventController {

    private final AdminClubEventService adminClubEventService;

    @Operation(summary = "Создать событие клуба")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UUID create(
            Authentication authentication,
            @Valid @RequestBody CreateClubEventRequest request
    ) {
        return adminClubEventService.create(AuthenticationUtils.getUserId(authentication), request);
    }

    @Operation(summary = "Обновить событие клуба")
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody CreateClubEventRequest request
    ) {
        adminClubEventService.update(AuthenticationUtils.getUserId(authentication), id, request);
    }
}
