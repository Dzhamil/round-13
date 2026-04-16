package com.round13.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Позиция заказа (конкретный товар в заказе).
 */
@Entity
@Table(name = "shop_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShopOrderItemEntity {

    /**
     * Идентификатор позиции заказа.
     */
    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    /**
     * Заказ, к которому относится позиция.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private ShopOrderEntity order;

    /**
     * Купленный товар.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private ShopProductEntity product;

    /**
     * Количество единиц товара.
     */
    @Column(name = "quantity", nullable = false)
    private int quantity;

    /**
     * Цена за единицу на момент покупки (в копейках).
     */
    @Column(name = "unit_amount", nullable = false)
    private int unitAmount;

    /**
     * Итоговая сумма по позиции (unitAmount * quantity).
     */
    @Column(name = "line_amount", nullable = false)
    private int lineAmount;

    /**
     * Дата создания позиции заказа.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
