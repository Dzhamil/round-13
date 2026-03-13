package com.round13.backend.module.shop.repo;

import com.round13.backend.domain.OrderStatus;
import com.round13.backend.domain.ShopOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
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
     * Возвращает заказ по id и пользователю.
     *
     * @param id     идентификатор заказа
     * @param userId идентификатор пользователя
     * @return заказ или пустой optional, если не найден
     */
    Optional<ShopOrderEntity> findByIdAndUserId(UUID id, UUID userId);

    /**
     * Возвращает список заказов по статусу.
     *
     * @param status статус заказа
     * @return список заказов с заданным статусом
     */
    List<ShopOrderEntity> findByStatus(OrderStatus status);

    /**
     * Проверяет существование заказа по id и статусу.
     *
     * @param id     идентификатор заказа
     * @param status статус заказа
     * @return true, если заказ существует, иначе false
     */
    boolean existsByIdAndStatus(UUID id, OrderStatus status);
}
