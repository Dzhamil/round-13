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
 * История изменений по пакетам тренировок пользователя.
 */
@Entity
@Table(name = "user_entitlement_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntitlementEventEntity {

    private static final int TYPE_MAX_LENGTH = 32;
    private static final int NOTE_MAX_LENGTH = 512;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "entitlement_id", nullable = false)
    private UUID entitlementId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = TYPE_MAX_LENGTH)
    private UserEntitlementEventType type;

    @Column(name = "delta", nullable = false)
    private int delta;

    @Column(name = "balance_after", nullable = false)
    private int balanceAfter;

    @Column(name = "club_event_id")
    private UUID clubEventId;

    @Column(name = "note", length = NOTE_MAX_LENGTH)
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
