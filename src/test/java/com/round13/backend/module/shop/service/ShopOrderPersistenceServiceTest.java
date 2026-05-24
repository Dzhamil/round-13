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
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ShopOrderPersistenceServiceTest {

    private final ShopOrderRepository orderRepository = mock(ShopOrderRepository.class);
    private final ShopOrderItemRepository itemRepository = mock(ShopOrderItemRepository.class);
    private final ShopOrderTrainingRequestRepository trainingRequestRepository =
            mock(ShopOrderTrainingRequestRepository.class);
    private final ShopOrderMapper mapper = mock(ShopOrderMapper.class);
    private final ShopOrderPersistenceService service = new ShopOrderPersistenceService(
            orderRepository,
            itemRepository,
            trainingRequestRepository,
            mapper
    );

    @Test
    @SuppressWarnings("unchecked")
    void persistStoresTrainingRequestForOrderItem() {
        UUID productId = UUID.randomUUID();
        UUID trainerId = UUID.randomUUID();
        OffsetDateTime requestedStartTime = OffsetDateTime.parse("2026-05-25T12:00:00Z");
        ShopOrderEntity order = new ShopOrderEntity();
        order.setId(UUID.randomUUID());
        ShopProductEntity product = new ShopProductEntity();
        product.setId(productId);
        ShopOrderItemEntity item = new ShopOrderItemEntity();
        item.setId(UUID.randomUUID());
        item.setOrder(order);
        item.setProduct(product);

        when(mapper.toOrderItem(order, product, 1)).thenReturn(item);
        when(itemRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.persist(
                order,
                Map.of(productId, 1),
                Map.of(productId, product),
                Map.of(productId, new ValidatedOrderData.TrainingRequestData(
                        productId,
                        trainerId,
                        requestedStartTime
                ))
        );

        verify(orderRepository).save(order);
        verify(itemRepository).saveAll(List.of(item));

        ArgumentCaptor<List<ShopOrderTrainingRequestEntity>> captor = ArgumentCaptor.forClass(List.class);
        verify(trainingRequestRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).hasSize(1);

        ShopOrderTrainingRequestEntity saved = captor.getValue().getFirst();
        assertThat(saved.getOrderItem()).isEqualTo(item);
        assertThat(saved.getProduct()).isEqualTo(product);
        assertThat(saved.getTrainerId()).isEqualTo(trainerId);
        assertThat(saved.getRequestedStartTime()).isEqualTo(requestedStartTime);
    }
}
