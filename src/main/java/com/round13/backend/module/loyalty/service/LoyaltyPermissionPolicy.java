package com.round13.backend.module.loyalty.service;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.loyalty.domain.LoyaltyPointSourceType;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.user.UserRoleCodes;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class LoyaltyPermissionPolicy {

    private static final Set<LoyaltyPointSourceType> TRAINER_AWARDABLE_TYPES = EnumSet.of(
            LoyaltyPointSourceType.CLUB_EVENT_ATTENDANCE,
            LoyaltyPointSourceType.FITNESS_NORM_IMPROVEMENT,
            LoyaltyPointSourceType.MONTHLY_COMPLEX_PLACEMENT,
            LoyaltyPointSourceType.CLAN_WAR_PLACEMENT,
            LoyaltyPointSourceType.PHYSICAL_PREPARATION_CHAMPIONSHIP,
            LoyaltyPointSourceType.BOXING_MATCH,
            LoyaltyPointSourceType.MANUAL_ADJUSTMENT
    );

    private final UserRepository userRepository;
    private final UserTrainerLinkRepository userTrainerLinkRepository;

    public void requireCanAward(UUID actorUserId, UUID memberId, LoyaltyPointSourceType sourceType) {
        String roleCode = requireRoleCode(actorUserId);
        if (UserRoleCodes.ADMIN.equals(roleCode)) {
            return;
        }
        if (UserRoleCodes.COACH.equals(roleCode)
                && TRAINER_AWARDABLE_TYPES.contains(sourceType)
                && memberId != null
                && userTrainerLinkRepository.existsByTrainerIdAndStudentId(actorUserId, memberId)) {
            return;
        }
        throw new BusinessException(ErrorCode.LOYALTY_FORBIDDEN);
    }

    public void requireCanCorrectOrRevoke(UUID actorUserId) {
        String roleCode = requireRoleCode(actorUserId);
        if (!UserRoleCodes.ADMIN.equals(roleCode)) {
            throw new BusinessException(ErrorCode.LOYALTY_FORBIDDEN);
        }
    }

    private String requireRoleCode(UUID actorUserId) {
        if (actorUserId == null) {
            throw new BusinessException(ErrorCode.LOYALTY_FORBIDDEN);
        }
        return userRepository.findRoleCode(actorUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.LOYALTY_FORBIDDEN));
    }
}
