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
@Table(name = "loyalty_scoring_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyScoringRuleEntity {

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "code", nullable = false, length = 96)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 48)
    private LoyaltyPointSourceType sourceType;

    @Column(name = "version", nullable = false)
    private int version;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> config = new LinkedHashMap<>();

    @Column(name = "valid_from", nullable = false)
    private OffsetDateTime validFrom;

    @Column(name = "valid_to")
    private OffsetDateTime validTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private UserEntity createdByUser;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
