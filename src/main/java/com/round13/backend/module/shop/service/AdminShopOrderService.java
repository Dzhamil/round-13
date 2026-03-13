package com.round13.backend.module.shop.service;

import com.round13.backend.domain.OrderStatus;
import com.round13.backend.domain.ShopOrderEntity;
import com.round13.backend.domain.ShopOrderItemEntity;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.domain.UserEntity;
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
        List<ShopOrderEntity> orders = orderRepository.findByStatus(OrderStatus.PENDING);
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

            result.add(new PurchaseRequestDto(
                    order.getId(),
                    buyerName,
                    avatarUrl,
                    categoryTitle,
                    productTitle
            ));
        }

        return result;
    }
}
