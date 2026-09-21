package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopOrderItemEntity;
import com.round13.backend.domain.ShopOrderTrainingRequestEntity;
import com.round13.backend.module.shop.repo.ShopOrderItemRepository;
import com.round13.backend.module.shop.repo.ShopOrderTrainingRequestRepository;
import java.util.*;

record OrderListData(Map<UUID, List<ShopOrderItemEntity>> items,
                     Map<UUID, ShopOrderTrainingRequestEntity> requests) {
    static OrderListData load(List<UUID> ids, ShopOrderItemRepository itemsRepository,
                              ShopOrderTrainingRequestRepository requestsRepository) {
        Map<UUID, List<ShopOrderItemEntity>> items = new HashMap<>();
        Map<UUID, ShopOrderTrainingRequestEntity> requests = new HashMap<>();
        if (!ids.isEmpty()) {
            itemsRepository.findByOrderIdIn(ids).forEach(item ->
                    items.computeIfAbsent(item.getOrder().getId(), ignored -> new ArrayList<>()).add(item));
            requestsRepository.findByOrderItemOrderIdIn(ids).forEach(request ->
                    requests.putIfAbsent(request.getOrderItem().getOrder().getId(), request));
        }
        return new OrderListData(items, requests);
    }

    List<ShopOrderItemEntity> itemsFor(UUID id) { return items.getOrDefault(id, List.of()); }
}
