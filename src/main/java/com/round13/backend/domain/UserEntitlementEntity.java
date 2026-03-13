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

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Начисление услуги пользователю после покупки.
 */
@Entity
@Table(name = "user_entitlements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntitlementEntity {

    /**
     * Идентификатор начисления.
     */
    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    /**
     * Пользователь, которому начислена услуга.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    /**
     * Заказ-источник начисления (может быть null).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_order_id")
    private ShopOrderEntity sourceOrder;

    /**
     * Тип начисления.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private EntitlementType type;

    /**
     * Количество (например, число тренировок). Может быть null.
     */
    @Column
    private Integer quantity;

    /**
     * Действует до даты (например, абонемент). Может быть null.
     */
    @Column(name = "valid_until")
    private OffsetDateTime validUntil;

    /**
     * Комментарий/примечание (опционально).
     */
    @Column(length = 512)
    private String note;

    /**
     * Дата создания начисления.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
