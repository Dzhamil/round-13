package com.round13.backend.module.shop.mapper;

import com.round13.backend.domain.ShopOrderEntity;
import com.round13.backend.module.shop.dto.PurchaseRequestDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.time.OffsetDateTime;
import java.util.UUID;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AdminShopOrderMapper {

    @Mapping(target = "id", source = "order.id")
    @Mapping(target = "totalAmount", source = "order.totalAmount")
    @Mapping(target = "currency", source = "order.currency")
    @Mapping(target = "createdAt", source = "order.createdAt")
    @Mapping(target = "updatedAt", source = "order.updatedAt")
    @Mapping(target = "status", source = "order.status")
    @Mapping(target = "buyerName", source = "buyerName")
    @Mapping(target = "avatarUrl", source = "avatarUrl")
    @Mapping(target = "category", source = "categoryTitle")
    @Mapping(target = "productTitle", source = "productTitle")
    @Mapping(target = "itemCount", source = "itemCount")
    @Mapping(target = "requestedStartTime", source = "requestedStartTime")
    @Mapping(target = "requestedTrainerId", source = "requestedTrainerId")
    PurchaseRequestDto toPurchaseRequest(
            ShopOrderEntity order,
            String buyerName,
            String avatarUrl,
            String categoryTitle,
            String productTitle,
            int itemCount,
            OffsetDateTime requestedStartTime,
            UUID requestedTrainerId
    );
}
