package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopOrderEntity;
import com.round13.backend.domain.ShopOrderItemEntity;
import com.round13.backend.domain.ShopOrderTrainingRequestEntity;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.module.shop.dto.ValidatedOrderData;
import com.round13.backend.module.shop.mapper.ShopOrderMapper;
import com.round13.backend.module.shop.repo.ShopOrderItemRepository;
import com.round13.backend.module.shop.repo.ShopOrderRepository;
import com.round13.backend.module.shop.repo.ShopOrderTrainingRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShopOrderPersistenceService {

    private final ShopOrderRepository orderRepository;
    private final ShopOrderItemRepository itemRepository;
    private final ShopOrderTrainingRequestRepository trainingRequestRepository;
    private final ShopOrderMapper mapper;

    @Transactional
    public UUID persist(
            ShopOrderEntity order,
            Map<UUID, Integer> quantities,
            Map<UUID, ShopProductEntity> products,
            Map<UUID, ValidatedOrderData.TrainingRequestData> trainingRequests
    ) {
        orderRepository.save(order);

        List<ShopOrderItemEntity> items = quantities.entrySet().stream()
                .map(e -> {
                    ShopProductEntity p = products.get(e.getKey());
                    int qty = e.getValue();
                    return mapper.toOrderItem(order, p, qty);
                })
                .toList();

        List<ShopOrderItemEntity> savedItems = itemRepository.saveAll(items);
        persistTrainingRequests(savedItems, trainingRequests);
        return order.getId();
    }

    private void persistTrainingRequests(
            List<ShopOrderItemEntity> items,
            Map<UUID, ValidatedOrderData.TrainingRequestData> trainingRequests
    ) {
        if (trainingRequests.isEmpty()) {
            return;
        }

        List<ShopOrderTrainingRequestEntity> entities = items.stream()
                .map(item -> toTrainingRequest(item, trainingRequests.get(item.getProduct().getId())))
                .filter(Objects::nonNull)
                .toList();

        trainingRequestRepository.saveAll(entities);
    }

    private ShopOrderTrainingRequestEntity toTrainingRequest(
            ShopOrderItemEntity item,
            ValidatedOrderData.TrainingRequestData data
    ) {
        if (data == null) {
            return null;
        }

        ShopOrderTrainingRequestEntity entity = new ShopOrderTrainingRequestEntity();
        entity.setOrderItem(item);
        entity.setProduct(item.getProduct());
        entity.setTrainerId(data.trainerId());
        entity.setRequestedStartTime(data.requestedStartTime());
        return entity;
    }
}
