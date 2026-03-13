package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopOrderEntity;
import com.round13.backend.domain.ShopOrderItemEntity;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.shop.dto.CreateShopOrderRequest;
import com.round13.backend.module.shop.dto.OrderCalculation;
import com.round13.backend.module.shop.dto.ShopOrderListItemResponse;
import com.round13.backend.module.shop.dto.ValidatedOrderData;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.shop.mapper.ShopOrderHistoryMapper;
import com.round13.backend.module.shop.mapper.ShopOrderMapper;
import com.round13.backend.module.shop.repo.ShopOrderItemRepository;
import com.round13.backend.module.shop.repo.ShopOrderRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Сервис заказов магазина.
 */
@Service
@RequiredArgsConstructor
public class ShopOrderService {

    private static final String DEFAULT_ORDER_HISTORY_TITLE = "Заказ";

    private final UserRepository userRepository;
    private final ShopOrderRepository shopOrderRepository;
    private final ShopOrderItemRepository shopOrderItemRepository;
    private final ShopOrderValidationService validationService;
    private final ShopOrderHistoryMapper shopOrderHistoryMapper;
    private final ShopOrderMapper shopOrderMapper;
    private final ShopOrderPersistenceService persistenceService;

    public UUID createOrder(UUID userId, CreateShopOrderRequest request) {
        UserEntity user = getUser(userId);

        ValidatedOrderData data = validationService.validate(request);

        OrderCalculation calculation = calculateTotal(data.quantities(), data.products());

        ShopOrderEntity order = shopOrderMapper.toPendingOrder(
                user,
                calculation.totalAmount(),
                calculation.currency()
        );

        return persistenceService.persist(order, data.quantities(), data.products());
    }

    /**
     * Возвращает историю заказов пользователя.
     */
    @Transactional(readOnly = true)
    public List<ShopOrderListItemResponse> getMyOrders(UUID userId) {
        getUser(userId);

        return shopOrderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toListItem)
                .toList();
    }

    private UserEntity getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private OrderCalculation calculateTotal(
            Map<UUID, Integer> quantities,
            Map<UUID, ShopProductEntity> products
    ) {
        int total = 0;
        String currency = null;

        for (Map.Entry<UUID, Integer> entry : quantities.entrySet()) {
            ShopProductEntity product = products.get(entry.getKey());
            int qty = entry.getValue();

            int lineAmount = Math.multiplyExact(product.getPriceAmount(), qty);
            total = Math.addExact(total, lineAmount);

            currency = product.getCurrency();
        }

        return new OrderCalculation(total, currency);
    }

    private ShopOrderListItemResponse toListItem(ShopOrderEntity order) {
        List<ShopOrderItemEntity> items = shopOrderItemRepository.findByOrderId(order.getId());
        String title = DEFAULT_ORDER_HISTORY_TITLE;
        int itemCount = 0;

        if (!items.isEmpty()) {
            ShopOrderItemEntity firstItem = items.getFirst();
            title = firstItem.getProduct().getTitle();
            itemCount = items.stream()
                    .mapToInt(ShopOrderItemEntity::getQuantity)
                    .sum();
        }

        return shopOrderHistoryMapper.toListItem(order, title, itemCount);
    }
}
