package com.round13.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Заказ (покупка) пользователя в магазине.
 */
@Entity
@Table(name = "shop_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShopOrderEntity {

    /**
     * Идентификатор заказа.
     */
    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    /**
     * Пользователь, создавший заказ.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    /**
     * Статус заказа.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private OrderStatus status;

    /**
     * Итоговая сумма заказа в минимальных денежных единицах (копейки).
     */
    @Column(name = "total_amount", nullable = false)
    private int totalAmount;

    /**
     * Валюта (обычно RUB).
     */
    @Column(nullable = false, length = 8)
    private String currency;

    /**
     * Провайдер платежей (опционально).
     */
    @Column(name = "payment_provider", length = 32)
    private String paymentProvider;

    /**
     * Идентификатор платежа у провайдера (опционально).
     */
    @Column(name = "provider_payment_id", length = 128)
    private String providerPaymentId;

    /**
     * Дата создания.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Дата обновления.
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
