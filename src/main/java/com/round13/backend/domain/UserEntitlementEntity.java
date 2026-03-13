package com.round13.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Активированная услуга/пакет пользователя, возникшая из подтвержденного заказа.
 */
@Entity
@Table(name = "user_entitlements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntitlementEntity {

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "source_order_id")
    private UUID sourceOrderId;

    @Column(name = "product_id")
    private UUID productId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 32)
    private UserEntitlementType type;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "remaining_quantity")
    private Integer remainingQuantity;

    @Column(name = "trainer_id")
    private UUID trainerId;

    @Column(name = "valid_until")
    private OffsetDateTime validUntil;

    @Column(name = "note", length = 512)
    private String note;

    @Column(name = "activated_at")
    private OffsetDateTime activatedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
