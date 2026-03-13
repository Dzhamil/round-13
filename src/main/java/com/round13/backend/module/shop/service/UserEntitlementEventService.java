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

    private final UserEntitlementEventRepository userEntitlementEventRepository;
    private final UserEntitlementEventMapper userEntitlementEventMapper;

    public void recordActivated(UserEntitlementEntity entitlement) {
        record(entitlement, UserEntitlementEventType.ACTIVATED, resolvePositiveQuantity(entitlement), null, entitlement.getNote());
    }

    public void recordReservation(UserEntitlementEntity entitlement, UUID clubEventId, String clubEventTitle) {
        record(entitlement, UserEntitlementEventType.RESERVED_FOR_EVENT, -1, clubEventId, clubEventTitle);
    }

    public void recordRefund(UserEntitlementEntity entitlement, UUID clubEventId, String clubEventTitle) {
        record(entitlement, UserEntitlementEventType.REFUNDED, 1, clubEventId, clubEventTitle);
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
                        resolveBalanceAfter(entitlement),
                        clubEventId,
                        note
                )
        );
    }

    private int resolvePositiveQuantity(UserEntitlementEntity entitlement) {
        if (entitlement.getQuantity() != null && entitlement.getQuantity() > 0) {
            return entitlement.getQuantity();
        }
        return resolveBalanceAfter(entitlement);
    }

    private int resolveBalanceAfter(UserEntitlementEntity entitlement) {
        if (entitlement.getRemainingQuantity() != null) {
            return entitlement.getRemainingQuantity();
        }
        if (entitlement.getQuantity() != null) {
            return entitlement.getQuantity();
        }
        return 0;
    }
}
