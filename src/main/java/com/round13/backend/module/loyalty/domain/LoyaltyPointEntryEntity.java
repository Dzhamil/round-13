package com.round13.backend.module.loyalty.domain;

import com.round13.backend.domain.UserEntity;
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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "loyalty_point_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyPointEntryEntity {

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private UserEntity member;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 48)
    private LoyaltyPointSourceType sourceType;

    @Column(name = "points_delta", nullable = false)
    private int pointsDelta;

    @Column(name = "event_date", nullable = false)
    private OffsetDateTime eventDate;

    @Column(name = "source_entity_id")
    private UUID sourceEntityId;

    @Column(name = "source_entity_type", length = 64)
    private String sourceEntityType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by_user_id")
    private UserEntity recordedByUser;

    @Column(name = "recorded_at", nullable = false)
    private OffsetDateTime recordedAt;

    @Column(name = "reason", nullable = false, length = 512)
    private String reason;

    @Column(name = "rule_code", length = 96)
    private String ruleCode;

    @Column(name = "rule_version")
    private Integer ruleVersion;

    @Column(name = "idempotency_key", nullable = false, length = 160)
    private String idempotencyKey;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> metadata = new LinkedHashMap<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "correction_of_entry_id")
    private LoyaltyPointEntryEntity correctionOfEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revoked_entry_id")
    private LoyaltyPointEntryEntity revokedEntry;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
