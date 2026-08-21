package com.round13.backend.module.members.potential;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.user.UserRoleCodes;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BoxerPotentialAccessPolicy {

    private final UserRepository userRepository;
    private final UserTrainerLinkRepository userTrainerLinkRepository;

    public boolean canRead(UUID actorId, UUID memberId) {
        if (actorId == null || memberId == null) {
            return false;
        }
        String actorRole = roleCode(actorId);
        if (actorId.equals(memberId)) {
            return true;
        }
        if (UserRoleCodes.ADMIN.equals(actorRole)) {
            return isFighter(memberId);
        }
        return UserRoleCodes.COACH.equals(actorRole)
                && isFighter(memberId)
                && userTrainerLinkRepository.existsByTrainerIdAndStudentId(actorId, memberId);
    }

    public boolean canCreate(UUID actorId, UUID memberId) {
        if (actorId == null || memberId == null || !isFighter(memberId)) {
            return false;
        }
        if (actorId.equals(memberId)) {
            return false;
        }
        String actorRole = roleCode(actorId);
        if (UserRoleCodes.ADMIN.equals(actorRole)) {
            return true;
        }
        return UserRoleCodes.COACH.equals(actorRole)
                && userTrainerLinkRepository.existsByTrainerIdAndStudentId(actorId, memberId);
    }

    public void requireRead(UUID actorId, UUID memberId) {
        if (!canRead(actorId, memberId)) {
            throw new BusinessException(ErrorCode.BOXER_POTENTIAL_FORBIDDEN);
        }
    }

    public void requireCreate(UUID actorId, UUID memberId) {
        if (!isFighter(memberId)) {
            throw new BusinessException(ErrorCode.BOXER_POTENTIAL_TARGET_FORBIDDEN);
        }
        if (!canCreate(actorId, memberId)) {
            throw new BusinessException(ErrorCode.BOXER_POTENTIAL_FORBIDDEN);
        }
    }

    private boolean isFighter(UUID memberId) {
        String role = roleCode(memberId);
        return !UserRoleCodes.COACH.equals(role) && !UserRoleCodes.ADMIN.equals(role);
    }

    private String roleCode(UUID userId) {
        return userRepository.findRoleCode(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
