package com.round13.backend.module.members.potential;

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
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "boxer_potential_measurements")
@Getter
@Setter
public class BoxerPotentialMeasurementEntity {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private UserEntity member;

    @Column(name = "measured_at", nullable = false)
    private OffsetDateTime measuredAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private UserEntity createdByUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "norm_group", nullable = false, length = 16)
    private BoxerPotentialNormGroup normGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "norm_set", nullable = false, length = 16)
    private BoxerPotentialNormSet normSet;

    @Column(name = "age_at_measurement", nullable = false)
    private int ageAtMeasurement;

    @Column(name = "gender_at_measurement", nullable = false, length = 16)
    private String genderAtMeasurement;

    @Column(name = "push_ups_90_sec", nullable = false, precision = 8, scale = 2)
    private BigDecimal pushUps90Sec;

    @Column(name = "pull_ups", nullable = false, precision = 8, scale = 2)
    private BigDecimal pullUps;

    @Column(name = "jump_squats_90_sec", nullable = false, precision = 8, scale = 2)
    private BigDecimal jumpSquats90Sec;

    @Column(name = "punch_force_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal punchForceKg;

    @Column(name = "burpees_5_min", nullable = false, precision = 8, scale = 2)
    private BigDecimal burpees5Min;

    @Column(name = "punches_20_sec", nullable = false, precision = 8, scale = 2)
    private BigDecimal punches20Sec;

    @Column(name = "rope_jumps_60_sec", nullable = false, precision = 8, scale = 2)
    private BigDecimal ropeJumps60Sec;

    @Column(name = "double_unders_60_sec", nullable = false, precision = 8, scale = 2)
    private BigDecimal doubleUnders60Sec;

    @Column(name = "push_ups_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal pushUpsScore;

    @Column(name = "pull_ups_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal pullUpsScore;

    @Column(name = "jump_squats_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal jumpSquatsScore;

    @Column(name = "punch_force_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal punchForceScore;

    @Column(name = "burpees_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal burpeesScore;

    @Column(name = "punches_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal punchesScore;

    @Column(name = "rope_jumps_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal ropeJumpsScore;

    @Column(name = "double_unders_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal doubleUndersScore;

    @Column(name = "strength_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal strengthScore;

    @Column(name = "endurance_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal enduranceScore;

    @Column(name = "speed_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal speedScore;

    @Column(name = "agility_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal agilityScore;

    @Column(name = "potential_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal potentialScore;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
