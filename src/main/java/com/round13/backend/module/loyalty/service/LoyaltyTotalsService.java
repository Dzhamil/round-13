package com.round13.backend.module.loyalty.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatsEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.loyalty.domain.LoyaltyPointTotalEntity;
import com.round13.backend.module.loyalty.repo.LoyaltyPointEntryRepository;
import com.round13.backend.module.loyalty.repo.LoyaltyPointTotalRepository;
import com.round13.backend.module.members.repo.UserStatsCacheRepository;
import com.round13.backend.module.members.service.UserStatsFactory;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoyaltyTotalsService {

    private final LoyaltyPointEntryRepository pointEntryRepository;
    private final LoyaltyPointTotalRepository pointTotalRepository;
    private final UserRepository userRepository;
    private final UserStatsCacheRepository userStatsCacheRepository;
    private final UserStatsFactory userStatsFactory;
    private final LoyaltyRankService rankService;

    @Transactional
    public LoyaltyTotalsSnapshot recomputeForMember(UserEntity member) {
        if (member == null || member.getId() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        LoyaltyTotalsSnapshot snapshot = calculate(member.getId());
        LoyaltyPointTotalEntity total = pointTotalRepository.findById(member.getId())
                .orElseGet(() -> newTotal(member));

        LoyaltyRankProgress progress = snapshot.rankProgress();
        total.setMember(member);
        total.setTotalPoints(snapshot.totalPoints());
        total.setPositivePoints(snapshot.positivePoints());
        total.setNegativePoints(snapshot.negativePoints());
        total.setCurrentRankCode(progress.currentRank() == null ? null : progress.currentRank().getCode());
        total.setCurrentAchievementCode(progress.currentAchievement() == null ? null : progress.currentAchievement().getCode());
        total.setNextRankCode(progress.nextRank() == null ? null : progress.nextRank().getCode());
        total.setNextRankPoints(progress.nextRank() == null ? null : progress.nextRank().getMinPoints());
        total.setPointsToNextRank(progress.pointsToNextRank());
        total.setRecalculatedAt(OffsetDateTime.now());
        pointTotalRepository.save(total);

        syncUserStats(member, snapshot);
        return snapshot;
    }

    @Transactional
    public LoyaltyTotalsSnapshot recomputeForMember(UUID memberId) {
        UserEntity member = userRepository.findByIdWithRole(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return recomputeForMember(member);
    }

    @Transactional(readOnly = true)
    public LoyaltyTotalsSnapshot calculate(UUID memberId) {
        Object[] sums = pointEntryRepository.sumTotals(memberId);
        int total = numberAt(sums, 0);
        int positive = numberAt(sums, 1);
        int negative = numberAt(sums, 2);
        return new LoyaltyTotalsSnapshot(total, positive, negative, rankService.resolveProgress(total));
    }

    @Transactional(readOnly = true)
    public Optional<LoyaltyPointTotalEntity> findProjection(UUID memberId) {
        return pointTotalRepository.findById(memberId);
    }

    private LoyaltyPointTotalEntity newTotal(UserEntity member) {
        LoyaltyPointTotalEntity total = new LoyaltyPointTotalEntity();
        total.setMember(member);
        return total;
    }

    private void syncUserStats(UserEntity member, LoyaltyTotalsSnapshot snapshot) {
        UserStatsEntity stats = userStatsCacheRepository.findById(member.getId())
                .orElseGet(() -> userStatsFactory.createEmpty(member));
        stats.setUser(member);
        stats.setPoints(snapshot.totalPoints());
        String rankName = snapshot.rankProgress().currentRank() == null
                ? "Новичок"
                : snapshot.rankProgress().currentRank().getName();
        stats.setStatusLabel(rankName);
        userStatsCacheRepository.save(stats);
    }

    private int numberAt(Object[] values, int index) {
        if (values == null || index >= values.length || !(values[index] instanceof Number number)) {
            return 0;
        }
        return number.intValue();
    }
}
