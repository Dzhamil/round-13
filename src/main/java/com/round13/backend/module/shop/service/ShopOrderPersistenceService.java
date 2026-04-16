package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopOrderEntity;
import com.round13.backend.domain.ShopOrderItemEntity;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.module.shop.mapper.ShopOrderMapper;
import com.round13.backend.module.shop.repo.ShopOrderItemRepository;
import com.round13.backend.module.shop.repo.ShopOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShopOrderPersistenceService {

    private final ShopOrderRepository orderRepository;
    private final ShopOrderItemRepository itemRepository;
    private final ShopOrderMapper mapper;

    @Transactional
    public UUID persist(
            ShopOrderEntity order,
            Map<UUID, Integer> quantities,
            Map<UUID, ShopProductEntity> products
    ) {
        orderRepository.save(order);

        List<ShopOrderItemEntity> items = quantities.entrySet().stream()
                .map(e -> {
                    ShopProductEntity p = products.get(e.getKey());
                    int qty = e.getValue();
                    return mapper.toOrderItem(order, p, qty);
                })
                .toList();

        itemRepository.saveAll(items);
        return order.getId();
    }
}
