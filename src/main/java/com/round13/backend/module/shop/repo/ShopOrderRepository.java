package com.round13.backend.module.shop.repo;

import com.round13.backend.domain.OrderStatus;
import com.round13.backend.domain.ShopOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Репозиторий заказов магазина.
 */
public interface ShopOrderRepository extends JpaRepository<ShopOrderEntity, UUID> {

    /**
     * Возвращает список заказов пользователя в порядке создания (новые первыми).
     *
     * @param userId идентификатор пользователя
     * @return список заказов пользователя
     */
    List<ShopOrderEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Возвращает список заказов по статусу.
     *
     * @param status статус заказа
     * @return список заказов с заданным статусом
     */
    List<ShopOrderEntity> findByStatus(OrderStatus status);

    /**
     * Возвращает список заказов по статусу в порядке создания (новые первыми).
     *
     * @param status статус заказа
     * @return список заказов с заданным статусом
     */
    List<ShopOrderEntity> findByStatusOrderByCreatedAtDesc(OrderStatus status);

}
