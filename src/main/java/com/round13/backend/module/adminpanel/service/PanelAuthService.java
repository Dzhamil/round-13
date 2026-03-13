package com.round13.backend.module.adminpanel.service;

import com.round13.backend.domain.AdminAccountEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.adminpanel.dto.PanelLoginRequest;
import com.round13.backend.module.adminpanel.dto.PanelMeResponse;
import com.round13.backend.module.adminpanel.repo.AdminAccountRepository;
import com.round13.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PanelAuthService {

    private static final String PANEL_ROLE = "ROLE_PANEL_ADMIN";

    private final AdminAccountRepository adminAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Логин в админ-панель по login/password.
     * Возвращает access JWT для доступа к /api/panel/**.
     */
    @Transactional(readOnly = true)
    public String login(PanelLoginRequest request) {
        String login = request.getLogin() == null ? "" : request.getLogin().trim();
        String password = request.getPassword() == null ? "" : request.getPassword();

        AdminAccountEntity admin = adminAccountRepository.findByLogin(login)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (!admin.isActive()) {
            throw new BusinessException(ErrorCode.PANEL_ADMIN_DISABLED);
        }

        if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        return jwtService.generateAccessToken(
                String.valueOf(admin.getId()),
                List.of(PANEL_ROLE)
        );
    }

    /**
     * Лёгкая проверка токена: кто я.
     */
    @Transactional(readOnly = true)
    public PanelMeResponse me(UUID adminId) {
        AdminAccountEntity admin = adminAccountRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (!admin.isActive()) {
            throw new BusinessException(ErrorCode.PANEL_ADMIN_DISABLED);
        }

        return new PanelMeResponse(admin.getId(), admin.getLogin());
    }
}
