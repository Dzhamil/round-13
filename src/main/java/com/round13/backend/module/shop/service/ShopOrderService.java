package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopOrderEntity;
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
import com.round13.backend.module.shop.repo.ShopOrderRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Сервис заказов магазина.
 */
@Service
@RequiredArgsConstructor
public class ShopOrderService {

    private final UserRepository userRepository;
    private final ShopOrderRepository shopOrderRepository;
    private final ShopOrderValidationService validationService;
    private final ShopOrderMapper shopOrderMapper;
    private final ShopOrderPersistenceService persistenceService;
    private final ShopOrderHistoryMapper historyMapper;

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
    public List<ShopOrderListItemResponse> getMyOrders(UUID userId) {
        getUser(userId);

        return historyMapper.toListItems(
                shopOrderRepository.findByUserIdOrderByCreatedAtDesc(userId)
        );
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
}
