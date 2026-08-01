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

import java.util.UUID;

@Entity
@Table(name = "loyalty_rank_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyRankRuleEntity {

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "code", nullable = false, length = 96)
    private String code;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "min_points", nullable = false)
    private int minPoints;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "is_major", nullable = false)
    private boolean major;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;
}
