package com.round13.backend.module.loyalty.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "loyalty_achievement_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyAchievementRuleEntity {

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "code", nullable = false, length = 96)
    private String code;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "description", length = 512)
    private String description;

    @Column(name = "kind", nullable = false, length = 48)
    private String kind;

    @Column(name = "threshold_points")
    private Integer thresholdPoints;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> config = new LinkedHashMap<>();

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
