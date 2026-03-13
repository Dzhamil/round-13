package com.round13.backend.module.adminpanel.controller;

import com.round13.backend.module.adminpanel.dto.PanelLoginRequest;
import com.round13.backend.module.adminpanel.dto.PanelMeResponse;
import com.round13.backend.module.adminpanel.service.PanelAuthService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Контроллер аутентификации админ‑панели. Метод `/token` выдаёт JWT для совместимости,
 * а основной логин обрабатывается formLogin в SecurityConfig.
 */
@RestController
@RequestMapping("/api/panel/auth")
@RequiredArgsConstructor
public class PanelAuthController {

    private final PanelAuthService panelAuthService;

    /**
     * Возвращает JWT для админ‑панели (не используется в браузере, оставлено для интеграций).
     */
    @PostMapping("/token")
    public PanelAuthTokensResponse token(@Valid @RequestBody PanelLoginRequest request) {
        String accessToken = panelAuthService.login(request);
        return new PanelAuthTokensResponse(accessToken);
    }

    @GetMapping("/me")
    public PanelMeResponse me(Authentication authentication) {
        UUID adminId = UUID.fromString(authentication.getName());
        return panelAuthService.me(adminId);
    }

    @Getter
    @AllArgsConstructor
    public static class PanelAuthTokensResponse {
        private final String accessToken;
    }
}
