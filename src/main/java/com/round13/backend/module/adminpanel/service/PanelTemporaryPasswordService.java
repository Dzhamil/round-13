package com.round13.backend.module.adminpanel.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.adminpanel.controller.dto.PanelTemporaryPasswordResponse;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PanelTemporaryPasswordService {
    private static final Logger log = LoggerFactory.getLogger(PanelTemporaryPasswordService.class);

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final TemporaryPasswordGenerator passwordGenerator;

    @Transactional
    public PanelTemporaryPasswordResponse reset(UUID panelAdminId, UUID userId) {
        UserEntity user = users.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        String issuedPassword = passwordGenerator.generate();
        user.setPasswordHash(encoder.encode(issuedPassword));
        users.save(user);

        log.info("PANEL_ADMIN {} RESET_TEMPORARY_PASSWORD for user {}", panelAdminId, userId);
        return new PanelTemporaryPasswordResponse(userId, issuedPassword);
    }
}
