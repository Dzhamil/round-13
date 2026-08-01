package com.round13.backend.module.loyalty.domain;

import com.round13.backend.domain.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Persistable;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "loyalty_point_totals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyPointTotalEntity implements Persistable<UUID> {

    @Id
    @Column(name = "member_id", nullable = false, updatable = false)
    private UUID memberId;

    @OneToOne(optional = false)
    @MapsId
    @JoinColumn(name = "member_id", nullable = false)
    private UserEntity member;

    @Column(name = "total_points", nullable = false)
    private int totalPoints;

    @Column(name = "positive_points", nullable = false)
    private int positivePoints;

    @Column(name = "negative_points", nullable = false)
    private int negativePoints;

    @Column(name = "current_rank_code", length = 96)
    private String currentRankCode;

    @Column(name = "current_achievement_code", length = 96)
    private String currentAchievementCode;

    @Column(name = "next_rank_code", length = 96)
    private String nextRankCode;

    @Column(name = "next_rank_points")
    private Integer nextRankPoints;

    @Column(name = "points_to_next_rank")
    private Integer pointsToNextRank;

    @Column(name = "recalculated_at", nullable = false)
    private OffsetDateTime recalculatedAt;

    @Override
    @Transient
    public UUID getId() {
        return memberId;
    }

    @Override
    @Transient
    public boolean isNew() {
        return recalculatedAt == null;
    }
}
