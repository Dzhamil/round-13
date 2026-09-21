package com.round13.backend.module.shop.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.shop.mapper.*;
import com.round13.backend.module.shop.repo.*;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mapstruct.factory.Mappers;
import java.time.OffsetDateTime;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrderListsBatchTest {
    @ParameterizedTest @ValueSource(ints = {0, 1, 10, 100})
    void historiesBatchItemsAndRequestsAndKeepOrderAndEmptyOrderDifferences(int size) {
        var ordersRepo = mock(ShopOrderRepository.class); var itemsRepo = mock(ShopOrderItemRepository.class);
        var requestsRepo = mock(ShopOrderTrainingRequestRepository.class); var users = mock(UserRepository.class);
        var service = new ShopOrderService(users, ordersRepo, itemsRepo, mock(ShopOrderValidationService.class),
                Mappers.getMapper(ShopOrderHistoryMapper.class), mock(ShopOrderMapper.class), mock(ShopOrderPersistenceService.class), requestsRepo);
        var admin = new AdminShopOrderService(ordersRepo, itemsRepo, requestsRepo, mock(ShopOrderActivationService.class), Mappers.getMapper(AdminShopOrderMapper.class));
        var user = new UserEntity(); user.setId(UUID.randomUUID()); user.setNickname("Buyer");
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        var orders = new ArrayList<ShopOrderEntity>(); var items = new ArrayList<ShopOrderItemEntity>(); var requests = new ArrayList<ShopOrderTrainingRequestEntity>();
        var category = new ShopCategoryEntity(); category.setTitle("Category");
        var product = new ShopProductEntity(); product.setTitle("First"); product.setCategory(category);
        for (int i = 0; i < size; i++) {
            var order = new ShopOrderEntity(); order.setId(UUID.randomUUID()); order.setUser(user); order.setStatus(OrderStatus.PENDING); orders.add(order);
            if (i == 0) continue;
            for (int quantity : List.of(2, 3)) { var item = new ShopOrderItemEntity(); item.setOrder(order); item.setProduct(product); item.setQuantity(quantity); items.add(item); }
            if (i == 1) {
                var request = new ShopOrderTrainingRequestEntity(); request.setOrderItem(items.getFirst());
                request.setRequestedStartTime(OffsetDateTime.now()); request.setTrainerId(UUID.randomUUID()); requests.add(request);
                var second = new ShopOrderTrainingRequestEntity(); second.setOrderItem(items.getLast()); second.setRequestedStartTime(OffsetDateTime.now().plusDays(1)); requests.add(second);
            }
        }
        when(ordersRepo.findByUserIdOrderByCreatedAtDesc(user.getId())).thenReturn(orders);
        when(ordersRepo.findByStatusOrderByCreatedAtDesc(OrderStatus.PENDING)).thenReturn(orders);
        when(ordersRepo.findByStatusInOrderByUpdatedAtDesc(OrderStatus.processedStatuses())).thenReturn(orders);
        when(itemsRepo.findByOrderIdIn(any())).thenReturn(items); when(requestsRepo.findByOrderItemOrderIdIn(any())).thenReturn(requests);
        var history = service.getMyOrders(user.getId());
        assertThat(history).extracting(r -> r.id()).containsExactlyElementsOf(orders.stream().map(ShopOrderEntity::getId).toList());
        if (size > 0) { assertThat(history.getFirst().title()).isEqualTo("Заказ"); assertThat(history.getFirst().itemCount()).isZero(); }
        for (var queue : List.of(admin.getPendingOrders(), admin.getProcessedOrders())) {
            assertThat(queue).hasSize(Math.max(0, size - 1));
            assertThat(queue).allSatisfy(r -> { assertThat(r.productTitle()).isEqualTo("First"); assertThat(r.itemCount()).isEqualTo(5); });
            if (size > 1) { assertThat(queue.getFirst().requestedStartTime()).isEqualTo(requests.getFirst().getRequestedStartTime());
                assertThat(history.get(1).requestedStartTime()).isEqualTo(requests.getFirst().getRequestedStartTime());
                assertThat(queue.getLast().requestedStartTime()).isNull(); }
        }
        verify(itemsRepo, times(size == 0 ? 0 : 3)).findByOrderIdIn(any());
        verify(requestsRepo, times(size == 0 ? 0 : 3)).findByOrderItemOrderIdIn(any());
        verify(itemsRepo, never()).findByOrderId(any()); verify(requestsRepo, never()).findFirstByOrderItemOrderId(any());
    }
}
