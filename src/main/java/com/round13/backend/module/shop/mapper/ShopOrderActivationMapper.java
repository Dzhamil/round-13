package com.round13.backend.module.shop.mapper;

import com.round13.backend.domain.ShopOrderEntity;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.domain.TrainingBalanceEventType;
import com.round13.backend.domain.UserEntitlementEntity;
import com.round13.backend.module.members.dto.TrainingBalanceChangeCommand;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.time.OffsetDateTime;
import java.util.UUID;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShopOrderActivationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", source = "order.user.id")
    @Mapping(target = "sourceOrderId", source = "order.id")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "type", source = "product.entitlementType")
    @Mapping(target = "quantity", source = "units")
    @Mapping(target = "remainingQuantity", source = "units")
    @Mapping(target = "trainerId", source = "product.trainerId")
    @Mapping(target = "validUntil", ignore = true)
    @Mapping(target = "note", source = "product.title")
    @Mapping(target = "activatedAt", source = "activatedAt")
    @Mapping(target = "createdAt", ignore = true)
    UserEntitlementEntity toEntitlement(ShopOrderEntity order, ShopProductEntity product, int units, OffsetDateTime activatedAt);

    @Mapping(target = "trainerId", source = "product.trainerId")
    @Mapping(target = "studentId", source = "order.user.id")
    @Mapping(target = "quantity", source = "units")
    @Mapping(target = "eventType", source = "eventType")
    @Mapping(target = "createdByUserId", source = "activatedByUserId")
    TrainingBalanceChangeCommand toTrainingBalanceChangeCommand(
            ShopOrderEntity order,
            ShopProductEntity product,
            int units,
            TrainingBalanceEventType eventType,
            UUID activatedByUserId
    );
}
