package com.round13.backend.module.members.potential;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.members.potential.dto.BoxerPotentialLeaderboardItemResponse;
import com.round13.backend.module.members.potential.dto.BoxerPotentialLeaderboardResponse;
import com.round13.backend.module.members.potential.dto.BoxerPotentialMeasurementRequest;
import com.round13.backend.module.members.potential.dto.BoxerPotentialMeasurementResponse;
import com.round13.backend.module.members.potential.dto.BoxerPotentialSummaryResponse;
import com.round13.backend.module.user.dto.UserProfileBundle;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoxerPotentialService {

    private static final int DEFAULT_HISTORY_LIMIT = 50;
    private static final int MAX_HISTORY_LIMIT = 100;
    private static final int DEFAULT_LEADERBOARD_LIMIT = 20;
    private static final int MAX_LEADERBOARD_LIMIT = 100;

    private final UserRepository userRepository;
    private final BoxerPotentialMeasurementRepository measurementRepository;
    private final BoxerPotentialAccessPolicy accessPolicy;
    private final BoxerPotentialNormResolver normResolver;
    private final BoxerPotentialCalculationService calculationService;
    private final BoxerPotentialMapper mapper;

    @Transactional
    public BoxerPotentialMeasurementResponse createMeasurement(
            UUID actorId,
            UUID memberId,
            BoxerPotentialMeasurementRequest request
    ) {
        accessPolicy.requireCreate(actorId, memberId);

        UserProfileBundle memberBundle = userRepository.findUserProfileBundle(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        UserEntity actor = userRepository.findByIdWithRole(actorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        BoxerPotentialNormProfile normProfile = normResolver.resolve(
                memberBundle.profile(),
                request.measuredAt().toLocalDate()
        );
        BoxerPotentialRawValues raw = toRaw(request);
        BoxerPotentialScores scores = calculationService.calculate(raw, normProfile);

        BoxerPotentialMeasurementEntity entity = new BoxerPotentialMeasurementEntity();
        entity.setMember(memberBundle.user());
        entity.setCreatedByUser(actor);
        entity.setMeasuredAt(request.measuredAt());
        entity.setNormGroup(normProfile.normGroup());
        entity.setNormSet(normProfile.normSet());
        entity.setAgeAtMeasurement(normProfile.ageAtMeasurement());
        entity.setGenderAtMeasurement(normProfile.genderAtMeasurement());
        applyRaw(entity, raw);
        applyScores(entity, scores);

        return mapper.toResponse(measurementRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<BoxerPotentialMeasurementResponse> getMeasurements(UUID actorId, UUID memberId, int limit) {
        accessPolicy.requireRead(actorId, memberId);
        return measurementRepository
                .findByMemberIdOrderByMeasuredAtDescCreatedAtDesc(memberId, PageRequest.of(0, bounded(limit, DEFAULT_HISTORY_LIMIT, MAX_HISTORY_LIMIT)))
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BoxerPotentialMeasurementResponse getLatest(UUID actorId, UUID memberId) {
        accessPolicy.requireRead(actorId, memberId);
        return measurementRepository.findTopByMemberIdOrderByMeasuredAtDescCreatedAtDesc(memberId)
                .map(mapper::toResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public BoxerPotentialSummaryResponse getSummary(UUID actorId, UUID memberId) {
        accessPolicy.requireRead(actorId, memberId);
        List<BoxerPotentialMeasurementEntity> history = measurementRepository
                .findByMemberIdOrderByMeasuredAtDescCreatedAtDesc(memberId, PageRequest.of(0, DEFAULT_HISTORY_LIMIT));
        List<BoxerPotentialMeasurementResponse> responses = history.stream()
                .map(mapper::toResponse)
                .toList();
        List<com.round13.backend.module.members.potential.dto.BoxerPotentialChartPointResponse> chart = history.stream()
                .sorted(Comparator.comparing(BoxerPotentialMeasurementEntity::getMeasuredAt))
                .map(mapper::toChartPoint)
                .toList();

        boolean canCreate = accessPolicy.canCreate(actorId, memberId);
        String createBlockedReason = createBlockedReason(memberId, canCreate);

        return new BoxerPotentialSummaryResponse(
                responses.isEmpty() ? null : responses.getFirst(),
                responses,
                chart,
                canCreate && createBlockedReason == null,
                createBlockedReason
        );
    }

    @Transactional(readOnly = true)
    public BoxerPotentialLeaderboardResponse getLeaderboard(UUID actorId, BoxerPotentialNormGroup normGroup, int limit) {
        if (actorId == null) {
            throw new BusinessException(ErrorCode.BOXER_POTENTIAL_FORBIDDEN);
        }
        List<BoxerPotentialLeaderboardItemResponse> items = new ArrayList<>();
        List<BoxerPotentialLeaderboardRow> rows = measurementRepository.findLeaderboard(
                normGroup.name(),
                PageRequest.of(0, bounded(limit, DEFAULT_LEADERBOARD_LIMIT, MAX_LEADERBOARD_LIMIT))
        );
        for (int i = 0; i < rows.size(); i++) {
            BoxerPotentialLeaderboardRow row = rows.get(i);
            items.add(new BoxerPotentialLeaderboardItemResponse(
                    i + 1,
                    row.getMemberId(),
                    row.getNickname(),
                    row.getAvatarUrl(),
                    row.getMeasuredAt(),
                    row.getPotentialScore(),
                    row.getStrengthScore(),
                    row.getEnduranceScore(),
                    row.getSpeedScore(),
                    row.getAgilityScore()
            ));
        }
        return new BoxerPotentialLeaderboardResponse(normGroup.name(), normGroup.getLabel(), items);
    }

    private String createBlockedReason(UUID memberId, boolean canCreate) {
        if (!canCreate) {
            return null;
        }
        UserProfileBundle bundle = userRepository.findUserProfileBundle(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        ProfileEntity profile = bundle.profile();
        try {
            normResolver.resolve(profile, LocalDate.now());
            return null;
        } catch (BusinessException ex) {
            return ex.getMessage();
        }
    }

    private BoxerPotentialRawValues toRaw(BoxerPotentialMeasurementRequest request) {
        return new BoxerPotentialRawValues(
                request.pushUps90Sec(),
                request.pullUps(),
                request.jumpSquats90Sec(),
                request.punchForceKg(),
                request.burpees5Min(),
                request.punches20Sec(),
                request.ropeJumps60Sec(),
                request.doubleUnders60Sec()
        );
    }

    private void applyRaw(BoxerPotentialMeasurementEntity entity, BoxerPotentialRawValues raw) {
        entity.setPushUps90Sec(raw.pushUps90Sec());
        entity.setPullUps(raw.pullUps());
        entity.setJumpSquats90Sec(raw.jumpSquats90Sec());
        entity.setPunchForceKg(raw.punchForceKg());
        entity.setBurpees5Min(raw.burpees5Min());
        entity.setPunches20Sec(raw.punches20Sec());
        entity.setRopeJumps60Sec(raw.ropeJumps60Sec());
        entity.setDoubleUnders60Sec(raw.doubleUnders60Sec());
    }

    private void applyScores(BoxerPotentialMeasurementEntity entity, BoxerPotentialScores scores) {
        entity.setPushUpsScore(scores.pushUpsScore());
        entity.setPullUpsScore(scores.pullUpsScore());
        entity.setJumpSquatsScore(scores.jumpSquatsScore());
        entity.setPunchForceScore(scores.punchForceScore());
        entity.setBurpeesScore(scores.burpeesScore());
        entity.setPunchesScore(scores.punchesScore());
        entity.setRopeJumpsScore(scores.ropeJumpsScore());
        entity.setDoubleUndersScore(scores.doubleUndersScore());
        entity.setStrengthScore(scores.strengthScore());
        entity.setEnduranceScore(scores.enduranceScore());
        entity.setSpeedScore(scores.speedScore());
        entity.setAgilityScore(scores.agilityScore());
        entity.setPotentialScore(scores.potentialScore());
    }

    private int bounded(int limit, int defaultLimit, int maxLimit) {
        if (limit <= 0) {
            return defaultLimit;
        }
        return Math.min(limit, maxLimit);
    }
}
