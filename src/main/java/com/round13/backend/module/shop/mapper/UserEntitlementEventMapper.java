package com.round13.backend.module.shop.mapper;

import com.round13.backend.domain.UserEntitlementEntity;
import com.round13.backend.domain.UserEntitlementEventEntity;
import com.round13.backend.domain.UserEntitlementEventType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.UUID;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserEntitlementEventMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "entitlementId", source = "entitlement.id")
    @Mapping(target = "userId", source = "entitlement.userId")
    @Mapping(target = "type", source = "eventType")
    @Mapping(target = "delta", source = "delta")
    @Mapping(target = "balanceAfter", source = "balanceAfter")
    @Mapping(target = "clubEventId", source = "clubEventId")
    @Mapping(target = "note", source = "note")
    @Mapping(target = "createdAt", ignore = true)
    UserEntitlementEventEntity toEntity(
            UserEntitlementEntity entitlement,
            UserEntitlementEventType eventType,
            int delta,
            int balanceAfter,
            UUID clubEventId,
            String note
    );
}
