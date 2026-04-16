package com.round13.backend.module.shop.service;

import com.round13.backend.domain.OrderStatus;
import com.round13.backend.domain.ShopOrderEntity;
import com.round13.backend.domain.ShopOrderItemEntity;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.shop.dto.PurchaseRequestDto;
import com.round13.backend.module.shop.mapper.AdminShopOrderMapper;
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
    private final ShopOrderActivationService shopOrderActivationService;
    private final AdminShopOrderMapper adminShopOrderMapper;

    /**
     * Получить список всех заявок на покупку (pending orders).
     */
    @Transactional(readOnly = true)
    public List<PurchaseRequestDto> getPendingOrders() {
        List<ShopOrderEntity> orders = orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.PENDING);
        return mapOrders(orders);
    }

    /**
     * История обработанных заказов.
     */
    @Transactional(readOnly = true)
    public List<PurchaseRequestDto> getProcessedOrders() {
        List<ShopOrderEntity> orders = orderRepository.findByStatusInOrderByUpdatedAtDesc(OrderStatus.processedStatuses());
        return mapOrders(orders);
    }

    private List<PurchaseRequestDto> mapOrders(List<ShopOrderEntity> orders) {
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

            result.add(adminShopOrderMapper.toPurchaseRequest(
                    order,
                    buyerName,
                    avatarUrl,
                    categoryTitle,
                    productTitle,
                    itemCount
            ));
        }

        return result;
    }

    /**
     * Обновить статус pending-заявки.
     */
    @Transactional
    public void updateStatus(java.util.UUID orderId, OrderStatus status, java.util.UUID updatedByUserId) {
        if (status == null || !status.canBeSetByAdmin()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        ShopOrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SHOP_ORDER_NOT_FOUND));

        if (!order.getStatus().isPending()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        if (status.isPaid()) {
            shopOrderActivationService.activatePaidOrder(order, updatedByUserId);
        }

        order.setStatus(status);
        orderRepository.save(order);
    }
}
