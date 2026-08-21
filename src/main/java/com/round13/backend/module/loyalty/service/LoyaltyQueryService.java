package com.round13.backend.module.loyalty.service;

import com.round13.backend.module.loyalty.domain.LoyaltyPointEntryEntity;
import com.round13.backend.module.loyalty.domain.LoyaltyPointTotalEntity;
import com.round13.backend.module.loyalty.dto.LoyaltyLeaderboardItemResponse;
import com.round13.backend.module.loyalty.dto.LoyaltyLeaderboardResponse;
import com.round13.backend.module.loyalty.dto.LoyaltyPointHistoryItemResponse;
import com.round13.backend.module.loyalty.dto.LoyaltySummaryResponse;
import com.round13.backend.module.loyalty.repo.LoyaltyPointEntryRepository;
import com.round13.backend.module.loyalty.repo.LoyaltyPointTotalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class LoyaltyQueryService {

    private static final int DEFAULT_HISTORY_LIMIT = 20;
    private static final int MAX_HISTORY_LIMIT = 100;
    private static final int DEFAULT_LEADERBOARD_LIMIT = 50;
    private static final int MAX_LEADERBOARD_LIMIT = 100;

    private final LoyaltyTotalsService totalsService;
    private final LoyaltyRankService rankService;
    private final LoyaltyPointEntryRepository pointEntryRepository;
    private final LoyaltyPointTotalRepository pointTotalRepository;

    @Transactional
    public LoyaltySummaryResponse summary(UUID memberId) {
        LoyaltyTotalsSnapshot snapshot = totalsService.findProjection(memberId)
                .map(this::snapshotFromProjection)
                .orElseGet(() -> totalsService.recomputeForMember(memberId));

        LoyaltyRankProgress progress = snapshot.rankProgress();
        return new LoyaltySummaryResponse(
                snapshot.totalPoints(),
                snapshot.positivePoints(),
                snapshot.negativePoints(),
                rankService.toRankResponse(progress.currentRank()),
                rankService.toRankResponse(progress.nextRank()),
                progress.pointsToNextRank(),
                progress.progressPercent(),
                rankService.toAchievementResponse(progress.currentAchievement())
        );
    }

    @Transactional(readOnly = true)
    public List<LoyaltyPointHistoryItemResponse> history(UUID memberId, Integer limit, OffsetDateTime before) {
        int safeLimit = Math.min(MAX_HISTORY_LIMIT, Math.max(1, limit == null ? DEFAULT_HISTORY_LIMIT : limit));
        return pointEntryRepository.findHistory(memberId, before, PageRequest.of(0, safeLimit))
                .stream()
                .map(this::toHistoryItem)
                .toList();
    }

    @Transactional(readOnly = true)
    public LoyaltyLeaderboardResponse leaderboard(Integer limit) {
        int safeLimit = Math.min(MAX_LEADERBOARD_LIMIT, Math.max(1, limit == null ? DEFAULT_LEADERBOARD_LIMIT : limit));
        AtomicInteger place = new AtomicInteger(1);
        List<LoyaltyLeaderboardItemResponse> items = pointTotalRepository.findLeaderboard(PageRequest.of(0, safeLimit))
                .stream()
                .map(total -> new LoyaltyLeaderboardItemResponse(
                        place.getAndIncrement(),
                        total.getMemberId(),
                        total.getMember().getNickname(),
                        total.getTotalPoints(),
                        rankService.rankResponse(total.getCurrentRankCode())
                ))
                .toList();
        return new LoyaltyLeaderboardResponse(items);
    }

    private LoyaltyTotalsSnapshot snapshotFromProjection(LoyaltyPointTotalEntity total) {
        return new LoyaltyTotalsSnapshot(
                total.getTotalPoints(),
                total.getPositivePoints(),
                total.getNegativePoints(),
                rankService.resolveProgress(total.getTotalPoints())
        );
    }

    public LoyaltyPointHistoryItemResponse toHistoryItem(LoyaltyPointEntryEntity entry) {
        return new LoyaltyPointHistoryItemResponse(
                entry.getId(),
                entry.getSourceType(),
                entry.getPointsDelta(),
                entry.getEventDate(),
                entry.getSourceEntityId(),
                entry.getSourceEntityType(),
                entry.getRecordedByUser() == null ? null : entry.getRecordedByUser().getId(),
                entry.getReason(),
                entry.getRuleCode(),
                entry.getRuleVersion(),
                entry.getMetadata() == null ? Map.of() : entry.getMetadata(),
                entry.getCorrectionOfEntry() == null ? null : entry.getCorrectionOfEntry().getId(),
                entry.getRevokedEntry() == null ? null : entry.getRevokedEntry().getId()
        );
    }
}
