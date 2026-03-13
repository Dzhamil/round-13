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

    private static final int EMPTY_BALANCE = 0;
    private static final int SINGLE_TRAINING_DEBIT = 1;

    private static final Comparator<UserEntitlementEntity> ACTIVE_ENTITLEMENT_PRIORITY =
            Comparator.comparing(UserEntitlementEntity::getValidUntil, Comparator.nullsLast(Comparator.naturalOrder()))
                    .thenComparing(UserEntitlementEntity::getActivatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                    .thenComparing(UserEntitlementEntity::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));

    private final UserEntitlementRepository userEntitlementRepository;

    public boolean debitOneIfPossible(UUID userId) {
        return reserveOneIfPossible(userId).isPresent();
    }

    public Optional<UUID> reserveOneIfPossible(UUID userId) {
        Optional<UserEntitlementEntity> activeEntitlement = findActiveEntitlement(userId);
        if (activeEntitlement.isEmpty()) {
            return Optional.empty();
        }

        UserEntitlementEntity entitlement = activeEntitlement.get();
        int remainingQuantity = resolveRemainingQuantity(entitlement);
        if (remainingQuantity < SINGLE_TRAINING_DEBIT) {
            return Optional.empty();
        }

        entitlement.setRemainingQuantity(remainingQuantity - SINGLE_TRAINING_DEBIT);
        UserEntitlementEntity saved = userEntitlementRepository.save(entitlement);
        return Optional.ofNullable(saved.getId());
    }

    public void refundOne(UUID entitlementId) {
        if (entitlementId == null) {
            return;
        }

        userEntitlementRepository.findById(entitlementId).ifPresent(entitlement -> {
            int remainingQuantity = resolveRemainingQuantity(entitlement);
            int totalQuantity = entitlement.getQuantity() != null ? entitlement.getQuantity() : remainingQuantity;
            entitlement.setRemainingQuantity(Math.min(totalQuantity, remainingQuantity + SINGLE_TRAINING_DEBIT));
            userEntitlementRepository.save(entitlement);
        });
    }

    @Transactional(readOnly = true)
    public int getRemainingGroupTrainings(UUID userId) {
        return userEntitlementRepository.findActiveByUserIdAndType(userId, UserEntitlementType.GROUP_TRAININGS)
                .stream()
                .mapToInt(this::resolveRemainingQuantity)
                .sum();
    }

    private Optional<UserEntitlementEntity> findActiveEntitlement(UUID userId) {
        return userEntitlementRepository.findActiveByUserIdAndType(userId, UserEntitlementType.GROUP_TRAININGS)
                .stream()
                .filter(entitlement -> resolveRemainingQuantity(entitlement) >= SINGLE_TRAINING_DEBIT)
                .min(ACTIVE_ENTITLEMENT_PRIORITY);
    }

    private int resolveRemainingQuantity(UserEntitlementEntity entitlement) {
        if (entitlement.getRemainingQuantity() != null) {
            return entitlement.getRemainingQuantity();
        }
        if (entitlement.getQuantity() != null) {
            return entitlement.getQuantity();
        }
        return EMPTY_BALANCE;
    }
}
