package com.round13.backend.module.shop.service;

import com.round13.backend.domain.OrderStatus;
import com.round13.backend.domain.ShopOrderEntity;
import com.round13.backend.domain.ShopOrderItemEntity;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.shop.dto.PurchaseRequestDto;
import com.round13.backend.module.shop.repo.ShopOrderItemRepository;
import com.round13.backend.module.shop.repo.ShopOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Сервис заявок на покупку для админки.
 */
@Service
@RequiredArgsConstructor
public class AdminShopOrderService {

    private final ShopOrderRepository orderRepository;
    private final ShopOrderItemRepository orderItemRepository;

    /**
     * Получить список всех заявок на покупку (pending orders).
     */
    @Transactional(readOnly = true)
    public List<PurchaseRequestDto> getPendingOrders() {
        List<ShopOrderEntity> orders = orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.PENDING);
        List<PurchaseRequestDto> result = new ArrayList<>();

        for (ShopOrderEntity order : orders) {
            UserEntity user = order.getUser();
            String buyerName = user.getNickname() != null ? user.getNickname() : user.getPhone();

            // для простоты аватар не загружаем (можно получить из ProfileEntity)
            String avatarUrl = null;

            List<ShopOrderItemEntity> items = orderItemRepository.findByOrderId(order.getId());
            if (items.isEmpty()) {
                continue;
            }

            ShopOrderItemEntity firstItem = items.getFirst();
            ShopProductEntity product = firstItem.getProduct();
            String categoryTitle = product.getCategory().getTitle();
            String productTitle = product.getTitle();
            int itemCount = items.stream()
                    .mapToInt(ShopOrderItemEntity::getQuantity)
                    .sum();

            result.add(new PurchaseRequestDto(
                    order.getId(),
                    buyerName,
                    avatarUrl,
                    categoryTitle,
                    productTitle,
                    order.getTotalAmount(),
                    order.getCurrency(),
                    order.getCreatedAt(),
                    itemCount
            ));
        }

        return result;
    }

    /**
     * Обновить статус pending-заявки.
     */
    @Transactional
    public void updateStatus(java.util.UUID orderId, OrderStatus status) {
        if (status != OrderStatus.PAID && status != OrderStatus.CANCELED) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        ShopOrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SHOP_ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        order.setStatus(status);
        orderRepository.save(order);
    }
}
