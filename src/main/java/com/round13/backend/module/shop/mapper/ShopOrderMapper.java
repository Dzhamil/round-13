package com.round13.backend.module.shop.mapper;

import com.round13.backend.domain.OrderStatus;
import com.round13.backend.domain.ShopOrderEntity;
import com.round13.backend.domain.ShopOrderItemEntity;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.domain.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Маппер заказов магазина.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShopOrderMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "paymentProvider", ignore = true)
    @Mapping(target = "providerPaymentId", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "user", source = "user")
    @Mapping(target = "totalAmount", source = "totalAmount")
    @Mapping(target = "currency", source = "currency")
    ShopOrderEntity toPendingOrder(UserEntity user, int totalAmount, String currency);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "order", source = "order")
    @Mapping(target = "product", source = "product")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "unitAmount", expression = "java(product.getPriceAmount())")
    @Mapping(target = "lineAmount", expression = "java(calculateLineAmount(product, quantity))")
    ShopOrderItemEntity toOrderItem(
            ShopOrderEntity order,
            ShopProductEntity product,
            int quantity
    );

    /**
     * Зафиксировано для константы в маппинге (OrderStatus.PENDING).
     */
    default OrderStatus pendingStatus() {
        return OrderStatus.PENDING;
    }

    default int calculateLineAmount(ShopProductEntity product, int quantity) {
        return Math.multiplyExact(product.getPriceAmount(), quantity);
    }
}
