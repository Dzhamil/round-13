package com.round13.backend.module.shop.mapper;

import com.round13.backend.domain.ShopOrderEntity;
import com.round13.backend.module.shop.dto.ShopOrderListItemResponse;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Маппер истории заказов магазина.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShopOrderHistoryMapper {

    ShopOrderListItemResponse toListItem(ShopOrderEntity entity);

    List<ShopOrderListItemResponse> toListItems(List<ShopOrderEntity> entities);
}
