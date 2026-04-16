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

    private static final int TYPE_MAX_LENGTH = 32;
    private static final int NOTE_MAX_LENGTH = 512;
    private static final int EMPTY_QUANTITY = 0;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "source_order_id")
    private UUID sourceOrderId;

    @Column(name = "product_id")
    private UUID productId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = TYPE_MAX_LENGTH)
    private UserEntitlementType type;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "remaining_quantity")
    private Integer remainingQuantity;

    @Column(name = "trainer_id")
    private UUID trainerId;

    @Column(name = "valid_until")
    private OffsetDateTime validUntil;

    @Column(name = "note", length = NOTE_MAX_LENGTH)
    private String note;

    @Column(name = "activated_at")
    private OffsetDateTime activatedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public int remainingQuantityOrZero() {
        if (remainingQuantity != null) {
            return remainingQuantity;
        }
        if (quantity != null) {
            return quantity;
        }
        return EMPTY_QUANTITY;
    }

    public int positiveQuantityOrRemaining() {
        if (quantity != null && quantity > EMPTY_QUANTITY) {
            return quantity;
        }
        return remainingQuantityOrZero();
    }

    public void debitQuantity(int quantityToDebit) {
        remainingQuantity = remainingQuantityOrZero() - quantityToDebit;
    }

    public void refundQuantity(int quantityToRefund) {
        int remaining = remainingQuantityOrZero();
        int total = quantity != null ? quantity : remaining;
        remainingQuantity = Math.min(total, remaining + quantityToRefund);
    }
}
