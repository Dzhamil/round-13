package com.round13.backend.module.loyalty.service;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.loyalty.domain.LoyaltyPointEntryEntity;
import com.round13.backend.module.loyalty.domain.LoyaltyPointSourceType;
import com.round13.backend.module.loyalty.domain.LoyaltyScoringRuleEntity;
import com.round13.backend.module.loyalty.dto.ManualPointAwardRequest;
import com.round13.backend.module.loyalty.dto.PointCorrectionRequest;
import com.round13.backend.module.loyalty.dto.PointRevokeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.temporal.WeekFields;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoyaltyAccrualService {

    private static final String TRAINING_PARTICIPATION_ENTITY_TYPE = "training_participants";

    private final LoyaltyPointLedgerService ledgerService;
    private final LoyaltyScoringRuleService scoringRuleService;
    private final LoyaltyPermissionPolicy permissionPolicy;

    @Transactional
    public LoyaltyPointEntryEntity accrueTrainingVisit(
            UUID memberId,
            UUID actorUserId,
            UUID trainingParticipantId,
            OffsetDateTime eventDate
    ) {
        LoyaltyScoringRuleEntity rule = scoringRuleService.getActiveRule(LoyaltyRuleCodes.TRAINING_VISIT_ATTENDED);
        int points = scoringRuleService.fixedPoints(rule.getCode());
        OffsetDateTime effectiveDate = eventDate == null ? OffsetDateTime.now() : eventDate;

        return ledgerService.createEntry(new LoyaltyEntryCommand(
                memberId,
                LoyaltyPointSourceType.TRAINING_VISIT,
                points,
                effectiveDate,
                trainingParticipantId,
                TRAINING_PARTICIPATION_ENTITY_TYPE,
                actorUserId,
                "Подтвержденное посещение тренировки",
                rule.getCode(),
                rule.getVersion(),
                "training-visit:%s".formatted(trainingParticipantId),
                Map.of(),
                null,
                null
        ));
    }

    @Transactional
    public LoyaltyPointEntryEntity awardManual(UUID actorUserId, ManualPointAwardRequest request) {
        if (request == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        permissionPolicy.requireCanAward(actorUserId, request.memberId(), request.sourceType());

        LoyaltyScoringRuleEntity rule = null;
        int points = request.pointsDelta() == null ? 0 : request.pointsDelta();
        if (request.ruleCode() != null && !request.ruleCode().isBlank()) {
            rule = scoringRuleService.getActiveRule(request.ruleCode());
            if (rule.getSourceType() != request.sourceType()) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST);
            }
            points = calculateRulePoints(rule, request.metadata());
        }

        if (points == 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        String key = manualIdempotencyKey(request, actorUserId, points);
        return ledgerService.createEntry(new LoyaltyEntryCommand(
                request.memberId(),
                request.sourceType(),
                points,
                request.eventDate() == null ? OffsetDateTime.now() : request.eventDate(),
                request.sourceEntityId(),
                request.sourceEntityType(),
                actorUserId,
                request.reason(),
                rule == null ? request.ruleCode() : rule.getCode(),
                rule == null ? null : rule.getVersion(),
                key,
                request.metadata(),
                null,
                null
        ));
    }

    @Transactional
    public LoyaltyPointEntryEntity correct(UUID actorUserId, UUID entryId, PointCorrectionRequest request) {
        permissionPolicy.requireCanCorrectOrRevoke(actorUserId);
        return ledgerService.correctEntry(
                entryId,
                request.pointsDelta(),
                actorUserId,
                request.eventDate(),
                request.reason(),
                request.metadata()
        );
    }

    @Transactional
    public LoyaltyPointEntryEntity revoke(UUID actorUserId, UUID entryId, PointRevokeRequest request) {
        permissionPolicy.requireCanCorrectOrRevoke(actorUserId);
        return ledgerService.revokeEntry(
                entryId,
                actorUserId,
                request.eventDate(),
                request.reason(),
                request.metadata()
        );
    }

    private int calculateRulePoints(LoyaltyScoringRuleEntity rule, Map<String, Object> metadata) {
        Map<String, Object> safeMetadata = metadata == null ? Map.of() : metadata;
        return switch (rule.getSourceType()) {
            case MONTHLY_COMPLEX_PLACEMENT, CLAN_WAR_PLACEMENT, PHYSICAL_PREPARATION_CHAMPIONSHIP ->
                    scoringRuleService.placementPoints(rule.getCode(), intMetadata(safeMetadata, "place"));
            case BOXING_MATCH -> scoringRuleService.boxingMatchPoints(
                    intMetadata(safeMetadata, "rounds"),
                    stringMetadata(safeMetadata, "outcome")
            );
            case FITNESS_NORM_IMPROVEMENT -> scoringRuleService.fitnessImprovementPoints(
                    doubleMetadata(safeMetadata, "improvementPercent")
            );
            default -> scoringRuleService.intValue(rule.getConfig(), "points");
        };
    }

    private String manualIdempotencyKey(ManualPointAwardRequest request, UUID actorUserId, int points) {
        if (request.sourceEntityId() != null && request.ruleCode() != null && !request.ruleCode().isBlank()) {
            return "manual:%s:%s:%s:%s".formatted(
                    request.memberId(),
                    request.sourceType(),
                    request.sourceEntityId(),
                    request.ruleCode()
            );
        }

        OffsetDateTime eventDate = request.eventDate() == null ? OffsetDateTime.now() : request.eventDate();
        Map<String, Object> metadata = request.metadata() == null ? new LinkedHashMap<>() : request.metadata();
        return "manual:%s:%s:%s:%d:%s:%d".formatted(
                request.memberId(),
                actorUserId,
                request.sourceType(),
                points,
                periodKey(eventDate),
                metadata.hashCode()
        );
    }

    private String periodKey(OffsetDateTime eventDate) {
        WeekFields weekFields = WeekFields.of(Locale.ROOT);
        YearMonth month = YearMonth.from(eventDate);
        int week = eventDate.get(weekFields.weekOfWeekBasedYear());
        return "%s:w%d:%d".formatted(month, week, eventDate.toEpochSecond());
    }

    private int intMetadata(Map<String, Object> metadata, String key) {
        Object value = metadata.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        throw new BusinessException(ErrorCode.INVALID_REQUEST);
    }

    private double doubleMetadata(Map<String, Object> metadata, String key) {
        Object value = metadata.get(key);
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        throw new BusinessException(ErrorCode.INVALID_REQUEST);
    }

    private String stringMetadata(Map<String, Object> metadata, String key) {
        Object value = metadata.get(key);
        if (value == null || String.valueOf(value).isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        return String.valueOf(value);
    }
}
