package com.round13.backend.module.shop.repo;

import com.round13.backend.domain.ShopOrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Репозиторий позиций заказа магазина.
 */
public interface ShopOrderItemRepository extends JpaRepository<ShopOrderItemEntity, UUID> {

    /**
     * Возвращает все позиции заказа (состав заказа).
     *
     * @param orderId идентификатор заказа
     * @return список позиций заказа
     */
    List<ShopOrderItemEntity> findByOrderId(UUID orderId);

    /**
     * Проверяет наличие позиции с конкретным товаром в заказе.
     *
     * @param orderId   идентификатор заказа
     * @param productId идентификатор товара
     * @return true, если позиция существует, иначе false
     */
    boolean existsByOrderIdAndProductId(UUID orderId, UUID productId);

    /**
     * Удаляет все позиции заказа.
     *
     * @param orderId идентификатор заказа
     */
    void deleteByOrderId(UUID orderId);
}
