package com.round13.backend.module.loyalty.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.loyalty.domain.LoyaltyPointEntryEntity;
import com.round13.backend.module.loyalty.domain.LoyaltyPointSourceType;
import com.round13.backend.module.loyalty.repo.LoyaltyPointEntryRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoyaltyPointLedgerService {

    private final LoyaltyPointEntryRepository pointEntryRepository;
    private final UserRepository userRepository;
    private final LoyaltyTotalsService totalsService;

    @Transactional
    public LoyaltyPointEntryEntity createEntry(LoyaltyEntryCommand command) {
        validateCommand(command);

        return pointEntryRepository.findByIdempotencyKey(command.idempotencyKey())
                .orElseGet(() -> persistNewEntry(command));
    }

    @Transactional
    public LoyaltyPointEntryEntity correctEntry(
            UUID entryId,
            int pointsDelta,
            UUID actorUserId,
            OffsetDateTime eventDate,
            String reason,
            Map<String, Object> metadata
    ) {
        if (pointsDelta == 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        LoyaltyPointEntryEntity original = pointEntryRepository.findById(entryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.LOYALTY_ENTRY_NOT_FOUND));

        String key = "correction:%s:%s:%d".formatted(original.getId(), actorUserId, System.nanoTime());
        return createEntry(new LoyaltyEntryCommand(
                original.getMember().getId(),
                LoyaltyPointSourceType.CORRECTION,
                pointsDelta,
                eventDate == null ? OffsetDateTime.now() : eventDate,
                original.getId(),
                "loyalty_point_entries",
                actorUserId,
                reason,
                null,
                null,
                key,
                metadata,
                original,
                null
        ));
    }

    @Transactional
    public LoyaltyPointEntryEntity revokeEntry(
            UUID entryId,
            UUID actorUserId,
            OffsetDateTime eventDate,
            String reason,
            Map<String, Object> metadata
    ) {
        LoyaltyPointEntryEntity original = pointEntryRepository.findById(entryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.LOYALTY_ENTRY_NOT_FOUND));
        if (original.getSourceType() == LoyaltyPointSourceType.REVERSAL || pointEntryRepository.existsByRevokedEntry_Id(entryId)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        return createEntry(new LoyaltyEntryCommand(
                original.getMember().getId(),
                LoyaltyPointSourceType.REVERSAL,
                -original.getPointsDelta(),
                eventDate == null ? OffsetDateTime.now() : eventDate,
                original.getId(),
                "loyalty_point_entries",
                actorUserId,
                reason,
                null,
                null,
                "reversal:%s".formatted(original.getId()),
                metadata,
                null,
                original
        ));
    }

    private LoyaltyPointEntryEntity persistNewEntry(LoyaltyEntryCommand command) {
        UserEntity member = userRepository.findByIdWithRole(command.memberId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        UserEntity actor = command.recordedByUserId() == null
                ? null
                : userRepository.findByIdWithRole(command.recordedByUserId()).orElse(null);

        LoyaltyPointEntryEntity entry = new LoyaltyPointEntryEntity();
        entry.setMember(member);
        entry.setSourceType(command.sourceType());
        entry.setPointsDelta(command.pointsDelta());
        entry.setEventDate(command.eventDate() == null ? OffsetDateTime.now() : command.eventDate());
        entry.setSourceEntityId(command.sourceEntityId());
        entry.setSourceEntityType(blankToNull(command.sourceEntityType()));
        entry.setRecordedByUser(actor);
        entry.setRecordedAt(OffsetDateTime.now());
        entry.setReason(command.reason().trim());
        entry.setRuleCode(blankToNull(command.ruleCode()));
        entry.setRuleVersion(command.ruleVersion());
        entry.setIdempotencyKey(command.idempotencyKey());
        entry.setMetadata(command.metadata() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(command.metadata()));
        entry.setCorrectionOfEntry(command.correctionOfEntry());
        entry.setRevokedEntry(command.revokedEntry());

        LoyaltyPointEntryEntity saved = pointEntryRepository.saveAndFlush(entry);
        totalsService.recomputeForMember(member);
        return saved;
    }

    private void validateCommand(LoyaltyEntryCommand command) {
        if (command == null
                || command.memberId() == null
                || command.sourceType() == null
                || command.pointsDelta() == 0
                || command.reason() == null
                || command.reason().isBlank()
                || command.idempotencyKey() == null
                || command.idempotencyKey().isBlank()
                || command.idempotencyKey().length() > 160) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
