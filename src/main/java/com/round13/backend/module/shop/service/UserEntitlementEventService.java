package com.round13.backend.module.shop.service;

import com.round13.backend.domain.UserEntitlementEntity;
import com.round13.backend.domain.UserEntitlementEventType;
import com.round13.backend.module.shop.mapper.UserEntitlementEventMapper;
import com.round13.backend.module.shop.repo.UserEntitlementEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserEntitlementEventService {

    private static final int SINGLE_TRAINING_QUANTITY = 1;

    private final UserEntitlementEventRepository userEntitlementEventRepository;
    private final UserEntitlementEventMapper userEntitlementEventMapper;

    public void recordActivated(UserEntitlementEntity entitlement) {
        UserEntitlementEventType eventType = UserEntitlementEventType.ACTIVATED;
        record(entitlement, eventType, eventType.signedDelta(entitlement.positiveQuantityOrRemaining()), null, entitlement.getNote());
    }

    public void recordReservation(UserEntitlementEntity entitlement, UUID clubEventId, String clubEventTitle) {
        UserEntitlementEventType eventType = UserEntitlementEventType.RESERVED_FOR_EVENT;
        record(entitlement, eventType, eventType.signedDelta(SINGLE_TRAINING_QUANTITY), clubEventId, clubEventTitle);
    }

    public void recordRefund(UserEntitlementEntity entitlement, UUID clubEventId, String clubEventTitle) {
        UserEntitlementEventType eventType = UserEntitlementEventType.REFUNDED;
        record(entitlement, eventType, eventType.signedDelta(SINGLE_TRAINING_QUANTITY), clubEventId, clubEventTitle);
    }

    private void record(
            UserEntitlementEntity entitlement,
            UserEntitlementEventType eventType,
            int delta,
            UUID clubEventId,
            String note
    ) {
        if (entitlement == null || entitlement.getId() == null) {
            return;
        }

        userEntitlementEventRepository.save(
                userEntitlementEventMapper.toEntity(
                        entitlement,
                        eventType,
                        delta,
                        entitlement.remainingQuantityOrZero(),
                        clubEventId,
                        note
                )
        );
    }
}
