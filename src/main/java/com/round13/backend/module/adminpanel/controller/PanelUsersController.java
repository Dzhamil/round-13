package com.round13.backend.module.adminpanel.controller;

import com.round13.backend.module.adminpanel.controller.dto.PanelUserListItemResponse;
import com.round13.backend.module.adminpanel.service.PanelUsersService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Admin Panel Users", description = "Управление пользователями приложения из админ-панели")
@RestController
@RequestMapping("/api/panel/users")
@RequiredArgsConstructor
public class PanelUsersController {

    private final PanelUsersService panelUsersService;

    @Operation(summary = "Получить список пользователей приложения")
    @GetMapping
    public List<PanelUserListItemResponse> getUsers() {
        return panelUsersService.getUsers();
    }

    @Operation(summary = "Назначить пользователю роль ADMIN")
    @PostMapping("/{userId}/grant-admin")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void grantAdmin(Authentication authentication, @PathVariable UUID userId) {
        UUID panelAdminId = UUID.fromString(authentication.getName());
        panelUsersService.grantAdmin(panelAdminId, userId);
    }

    @Operation(summary = "Снять ADMIN и вернуть роль COACH")
    @PostMapping("/{userId}/revoke-admin")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeAdmin(Authentication authentication, @PathVariable UUID userId) {
        UUID panelAdminId = UUID.fromString(authentication.getName());
        panelUsersService.revokeAdmin(panelAdminId, userId);
    }

    @Operation(summary = "Назначить пользователю роль COACH")
    @PostMapping("/{userId}/grant-coach")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void grantCoach(Authentication authentication, @PathVariable UUID userId) {
        UUID panelAdminId = UUID.fromString(authentication.getName());
        panelUsersService.grantCoach(panelAdminId, userId);
    }

    @Operation(summary = "Снять COACH (или ADMIN) и вернуть роль ATHLETE")
    @PostMapping("/{userId}/revoke-coach")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeCoach(Authentication authentication, @PathVariable UUID userId) {
        UUID panelAdminId = UUID.fromString(authentication.getName());
        panelUsersService.revokeCoach(panelAdminId, userId);
    }
}
