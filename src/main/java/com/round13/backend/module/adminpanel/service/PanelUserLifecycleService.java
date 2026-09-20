package com.round13.backend.module.adminpanel.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatus;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.adminpanel.repo.DeletedUserDataRepository;
import com.round13.backend.module.auth.service.RefreshTokenService;
import com.round13.backend.module.user.repo.RoleRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PanelUserLifecycleService {
    private final UserRepository users;
    private final RoleRepository roles;
    private final RefreshTokenService tokens;
    private final DeletedUserDataRepository deletedData;

    @Transactional
    public void block(UUID actorId, UUID userId) {
        UserEntity user = requireUser(userId);
        if (!user.isBlocked()) {
            user.setStatusBeforeBlock(user.getStatus());
            user.setStatus(UserStatus.BLOCKED);
        }
        tokens.revokeAllByUserId(userId);
        log.info("PANEL_ADMIN {} BLOCK user {}", actorId, userId);
    }

    @Transactional
    public void unblock(UUID actorId, UUID userId) {
        UserEntity user = requireUser(userId);
        if (user.isBlocked()) {
            UserStatus previous = user.getStatusBeforeBlock();
            user.setStatus(previous == null || previous == UserStatus.BLOCKED
                    ? UserStatus.PROFILE_INCOMPLETE : previous);
            user.setStatusBeforeBlock(null);
        }
        log.info("PANEL_ADMIN {} UNBLOCK user {}", actorId, userId);
    }

    @Transactional
    public void delete(UUID actorId, UUID userId) {
        UserEntity user = requireUser(userId);
        String oldPhone = user.getPhone();
        user.markDeleted(OffsetDateTime.now());
        user.setPermanentlyDeleted(true);
        user.setStatusBeforeBlock(null);
        user.setTelegramUserId(null);
        user.setPhone(null);
        user.setNickname(null);
        user.setPasswordHash(null);
        user.setRole(roles.findByCode("ATHLETE")
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND)));
        user.setTrainer(false);
        user.setPhoneVerifiedByStaff(false);
        user.setPhoneHidden(true);
        users.flush();
        deletedData.removeOwnedData(userId, oldPhone);
        log.info("PANEL_ADMIN {} DELETE user {}", actorId, userId);
    }

    private UserEntity requireUser(UUID userId) {
        return users.findByIdForUpdate(userId).filter(user -> !user.isPermanentlyDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
