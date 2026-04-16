package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopCategoryType;
import com.round13.backend.domain.ShopOrderEntity;
import com.round13.backend.domain.ShopOrderItemEntity;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.domain.TrainingBalanceEventType;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.shop.mapper.ShopOrderActivationMapper;
import com.round13.backend.module.members.service.TrainingBalanceService;
import com.round13.backend.module.shop.repo.ShopOrderItemRepository;
import com.round13.backend.module.shop.repo.UserEntitlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShopOrderActivationService {

    private static final int MIN_ENTITLEMENT_QUANTITY = 1;

    private final ShopOrderItemRepository shopOrderItemRepository;
    private final UserEntitlementRepository userEntitlementRepository;
    private final TrainingBalanceService trainingBalanceService;
    private final ShopOrderActivationMapper shopOrderActivationMapper;
    private final UserEntitlementEventService userEntitlementEventService;

    @Transactional
    public void activatePaidOrder(ShopOrderEntity order, UUID activatedByUserId) {
        List<ShopOrderItemEntity> items = shopOrderItemRepository.findByOrderId(order.getId());
        for (ShopOrderItemEntity item : items) {
            if (!isTrainingItem(item)) {
                continue;
            }

            activateTrainingItem(order, item, activatedByUserId);
        }
    }

    private void activateTrainingItem(ShopOrderEntity order, ShopOrderItemEntity item, UUID activatedByUserId) {
        ShopProductEntity product = item.getProduct();
        validateTrainingProduct(product);

        int units = Math.multiplyExact(item.getQuantity(), product.getEntitlementQuantity());
        var savedEntitlement = userEntitlementRepository.save(
                shopOrderActivationMapper.toEntitlement(order, product, units, OffsetDateTime.now())
        );
        if (product.getEntitlementType().isGroupTrainings()) {
            userEntitlementEventService.recordActivated(savedEntitlement);
        }

        if (product.getEntitlementType().isPersonalTrainings()) {
            trainingBalanceService.creditTrainings(
                    shopOrderActivationMapper.toTrainingBalanceChangeCommand(
                            order,
                            product,
                            units,
                            TrainingBalanceEventType.MANUAL_ADD,
                            activatedByUserId
                    )
            );
        }
    }

    private boolean isTrainingItem(ShopOrderItemEntity item) {
        ShopProductEntity product = item.getProduct();
        return product != null
                && product.getCategory() != null
                && product.getCategory().getType() == ShopCategoryType.TRAININGS;
    }

    private void validateTrainingProduct(ShopProductEntity product) {
        if (product.getEntitlementType() == null
                || product.getEntitlementQuantity() == null
                || product.getEntitlementQuantity() < MIN_ENTITLEMENT_QUANTITY) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        if (product.getEntitlementType().isPersonalTrainings() && product.getTrainerId() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
    }
}
