package com.round13.backend.module.adminpanel.errorjournal.controller;

import com.round13.backend.module.adminpanel.errorjournal.dto.ErrorJournalDetailResponse;
import com.round13.backend.module.adminpanel.errorjournal.dto.ErrorJournalListRequest;
import com.round13.backend.module.adminpanel.errorjournal.dto.ErrorJournalPageResponse;
import com.round13.backend.module.adminpanel.errorjournal.dto.ErrorJournalStatusUpdateRequest;
import com.round13.backend.module.adminpanel.errorjournal.service.PanelErrorJournalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Admin Panel Error Journal", description = "Журнал критических ошибок приложения")
@RestController
@RequestMapping("/api/panel/error-journal")
@PreAuthorize("hasRole('PANEL_ADMIN')")
@RequiredArgsConstructor
public class PanelErrorJournalController {

    private final PanelErrorJournalService service;

    @Operation(summary = "Получить список критических ошибок")
    @GetMapping
    public ErrorJournalPageResponse list(@Valid @ModelAttribute ErrorJournalListRequest request) {
        return service.list(request);
    }

    @Operation(summary = "Получить детальную запись критической ошибки")
    @GetMapping("/{id}")
    public ErrorJournalDetailResponse detail(@PathVariable UUID id) {
        return service.detail(id);
    }

    @Operation(summary = "Изменить статус записи критической ошибки")
    @PatchMapping("/{id}/status")
    public ErrorJournalDetailResponse updateStatus(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody ErrorJournalStatusUpdateRequest request
    ) {
        UUID panelAdminId = UUID.fromString(authentication.getName());
        return service.updateStatus(id, request.status(), request.note(), panelAdminId);
    }
}
