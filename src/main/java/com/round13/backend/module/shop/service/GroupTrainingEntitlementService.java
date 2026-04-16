package com.round13.backend.module.shop.service;

import com.round13.backend.domain.UserEntitlementEntity;
import com.round13.backend.domain.UserEntitlementType;
import com.round13.backend.module.shop.repo.UserEntitlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupTrainingEntitlementService {

    private static final int SINGLE_TRAINING_DEBIT = 1;

    private static final Comparator<UserEntitlementEntity> ACTIVE_ENTITLEMENT_PRIORITY =
            Comparator.comparing(UserEntitlementEntity::getValidUntil, Comparator.nullsLast(Comparator.naturalOrder()))
                    .thenComparing(UserEntitlementEntity::getActivatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                    .thenComparing(UserEntitlementEntity::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));

    private final UserEntitlementRepository userEntitlementRepository;
    private final UserEntitlementEventService userEntitlementEventService;

    public boolean debitOneIfPossible(UUID userId) {
        return reserveOneIfPossible(userId, null, null).isPresent();
    }

    public Optional<UUID> reserveOneIfPossible(UUID userId) {
        return reserveOneIfPossible(userId, null, null);
    }

    public Optional<UUID> reserveOneIfPossible(UUID userId, UUID clubEventId, String clubEventTitle) {
        Optional<UserEntitlementEntity> activeEntitlement = findActiveEntitlement(userId);
        if (activeEntitlement.isEmpty()) {
            return Optional.empty();
        }

        UserEntitlementEntity entitlement = activeEntitlement.get();
        int remainingQuantity = entitlement.remainingQuantityOrZero();
        if (remainingQuantity < SINGLE_TRAINING_DEBIT) {
            return Optional.empty();
        }

        entitlement.debitQuantity(SINGLE_TRAINING_DEBIT);
        UserEntitlementEntity saved = userEntitlementRepository.save(entitlement);
        userEntitlementEventService.recordReservation(saved, clubEventId, clubEventTitle);
        return Optional.ofNullable(saved.getId());
    }

    public void refundOne(UUID entitlementId, UUID clubEventId, String clubEventTitle) {
        if (entitlementId == null) {
            return;
        }

        userEntitlementRepository.findById(entitlementId).ifPresent(entitlement -> {
            entitlement.refundQuantity(SINGLE_TRAINING_DEBIT);
            UserEntitlementEntity saved = userEntitlementRepository.save(entitlement);
            userEntitlementEventService.recordRefund(saved, clubEventId, clubEventTitle);
        });
    }

    public void refundOne(UUID entitlementId) {
        refundOne(entitlementId, null, null);
    }

    @Transactional(readOnly = true)
    public int getRemainingGroupTrainings(UUID userId) {
        return userEntitlementRepository.findActiveByUserIdAndType(userId, UserEntitlementType.GROUP_TRAININGS)
                .stream()
                .mapToInt(UserEntitlementEntity::remainingQuantityOrZero)
                .sum();
    }

    private Optional<UserEntitlementEntity> findActiveEntitlement(UUID userId) {
        return userEntitlementRepository.findActiveByUserIdAndType(userId, UserEntitlementType.GROUP_TRAININGS)
                .stream()
                .filter(entitlement -> entitlement.remainingQuantityOrZero() >= SINGLE_TRAINING_DEBIT)
                .min(ACTIVE_ENTITLEMENT_PRIORITY);
    }
}
