package com.round13.backend.module.adminpanel.service;

import com.round13.backend.domain.RoleEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.adminpanel.controller.dto.PanelUserListItemResponse;
import com.round13.backend.module.user.repo.RoleRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PanelUsersService {

    private static final Logger log = LoggerFactory.getLogger(PanelUsersService.class);

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_COACH = "COACH";
    private static final String ROLE_ATHLETE = "ATHLETE";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public List<PanelUserListItemResponse> getUsers() {
        return userRepository.findAllWithRole().stream()
                .map(u -> new PanelUserListItemResponse(
                        u.getId(),
                        u.getNickname(),
                        u.getPhone(),
                        u.getStatus().name(),
                        u.getRole().getCode()
                ))
                .toList();
    }

    /**
     * Назначить бизнес-пользователю роль ADMIN.
     * Роль администратора теперь можно назначать любому пользователю (атлету или тренеру).
     */
    @Transactional
    public void grantAdmin(UUID panelAdminId, UUID targetUserId) {
        UserEntity user = userRepository.findByIdWithRole(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        // ранее админом можно было сделать только тренера. Сейчас убираем это ограничение.

        RoleEntity adminRole = roleRepository.findByCode(ROLE_ADMIN)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));

        user.setRole(adminRole);
        userRepository.save(user);

        log.info("PANEL_ADMIN {} GRANT_ADMIN to user {}", panelAdminId, targetUserId);
    }

    /**
     * Снять роль ADMIN и вернуть COACH (по правилу: админы только тренеры).
     */
    @Transactional
    public void revokeAdmin(UUID panelAdminId, UUID targetUserId) {
        UserEntity user = userRepository.findByIdWithRole(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        String currentRole = user.getRole().getCode();
        if (!ROLE_ADMIN.equals(currentRole)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        // при снятии админских прав пользователь становится тренером
        RoleEntity coachRole = roleRepository.findByCode(ROLE_COACH)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));

        user.setRole(coachRole);
        userRepository.save(user);

        log.info("PANEL_ADMIN {} REVOKE_ADMIN from user {}", panelAdminId, targetUserId);
    }

    /**
     * Назначить роль COACH пользователю. Любой пользователь (атлет или админ) может стать тренером.
     */
    @Transactional
    public void grantCoach(UUID panelAdminId, UUID targetUserId) {
        UserEntity user = userRepository.findByIdWithRole(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        RoleEntity coachRole = roleRepository.findByCode(ROLE_COACH)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));

        user.setRole(coachRole);
        userRepository.save(user);

        log.info("PANEL_ADMIN {} GRANT_COACH to user {}", panelAdminId, targetUserId);
    }

    /**
     * Снять роль COACH (или ADMIN) с пользователя, переведя его в роль ATHLETE.
     */
    @Transactional
    public void revokeCoach(UUID panelAdminId, UUID targetUserId) {
        UserEntity user = userRepository.findByIdWithRole(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        String currentRole = user.getRole().getCode();
        if (!ROLE_COACH.equals(currentRole) && !ROLE_ADMIN.equals(currentRole)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        RoleEntity athleteRole = roleRepository.findByCode(ROLE_ATHLETE)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));

        user.setRole(athleteRole);
        userRepository.save(user);

        log.info("PANEL_ADMIN {} REVOKE_COACH from user {}", panelAdminId, targetUserId);
    }
}
