package com.round13.backend.module.shop.mapper;

import com.round13.backend.domain.ShopOrderEntity;
import com.round13.backend.module.shop.dto.ShopOrderListItemResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Маппер истории заказов магазина.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShopOrderHistoryMapper {

    @Mapping(target = "id", source = "order.id")
    @Mapping(target = "status", source = "order.status")
    @Mapping(target = "totalAmount", source = "order.totalAmount")
    @Mapping(target = "currency", source = "order.currency")
    @Mapping(target = "createdAt", source = "order.createdAt")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "itemCount", source = "itemCount")
    ShopOrderListItemResponse toListItem(ShopOrderEntity order, String title, int itemCount);
}
