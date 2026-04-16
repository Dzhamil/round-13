package com.round13.backend.domain;

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
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.domain.Persistable;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Статистика пользователя (используется для профиля и кеша очков/статуса).
 */
@Entity
@Table(name = "user_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsEntity implements Persistable<UUID> {

    private static final int STATUS_LABEL_MAX_LENGTH = 64;

    @Id
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @OneToOne(optional = false)
    @MapsId
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "fights_count", nullable = false)
    private int fightsCount;

    @Column(name = "wins_count", nullable = false)
    private int winsCount;

    @Column(name = "defeats_count", nullable = false)
    private int defeatsCount;

    @Column(name = "knockouts_count", nullable = false)
    private int knockoutsCount;

    @Column(name = "knockdowns_count", nullable = false)
    private int knockdownsCount;

    @Column(name = "trainings_attended_count", nullable = false)
    private int trainingsAttendedCount;

    @Column(name = "trainings_missed_count", nullable = false)
    private int trainingsMissedCount;

    /**
     * Кеш очков, пересчитывается раз в сутки.
     */
    @Column(name = "points", nullable = false)
    private int points;

    /**
     * Кеш текстового статуса ("Новичок", "Тренер", ...), пересчитывается раз в сутки.
     */
    @Column(name = "status_label", nullable = false, length = STATUS_LABEL_MAX_LENGTH)
    private String statusLabel;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Override
    @Transient
    public UUID getId() {
        return userId;
    }

    @Override
    @Transient
    public boolean isNew() {
        return createdAt == null;
    }
}
