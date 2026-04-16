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

@Entity
@Table(name = "club_event_participants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClubEventParticipantEntity {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private ClubEventEntity event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "charged_entitlement_id")
    private UUID chargedEntitlementId;

    @Column(name = "charged_at")
    private OffsetDateTime chargedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public void markCharged(UUID entitlementId, OffsetDateTime chargedAt) {
        this.chargedEntitlementId = entitlementId;
        this.chargedAt = chargedAt;
    }

    public boolean canRefundChargeAt(OffsetDateTime dateTime) {
        return chargedEntitlementId != null
                && event != null
                && event.startsAfter(dateTime);
    }
}
