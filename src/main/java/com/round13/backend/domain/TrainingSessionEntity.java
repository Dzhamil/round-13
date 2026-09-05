package com.round13.backend.domain;

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
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Тренировочная сессия / мероприятие расписания.
 */
@Entity
@Table(name = "training_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrainingSessionEntity {

    private static final int TITLE_MAX_LENGTH = 256;
    private static final int TYPE_MAX_LENGTH = 16;
    private static final int LOCATION_MAX_LENGTH = 256;
    private static final int TIMEZONE_MAX_LENGTH = 64;

    /**
     * Идентификатор сессии.
     */
    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    /**
     * Название тренировки/мероприятия.
     */
    @Column(name = "title", nullable = false, length = TITLE_MAX_LENGTH)
    private String title;

    /**
     * Описание (опционально).
     */
    @Column(columnDefinition = "text")
    private String description;

    /**
     * Тип тренировки.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = TYPE_MAX_LENGTH)
    private TrainingType type;

    /**
     * Дата и время начала (таймзона важна).
     */
    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    /**
     * Длительность в минутах.
     */
    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    /**
     * Вместимость.
     *
     * <p>Если NULL — мест неограниченно (обычно для OPEN).</p>
     */
    @Column(name = "capacity")
    private Integer capacity;

    /**
     * Место проведения (опционально).
     */
    @Column(name = "location", length = LOCATION_MAX_LENGTH)
    private String location;

    /**
     * Тренер/организатор (опционально).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_user_id")
    private UserEntity coach;

    @Column(name = "schedule2_enabled", nullable = false)
    private boolean schedule2Enabled;

    @Column(name = "timezone", nullable = false, length = TIMEZONE_MAX_LENGTH)
    private String timezone = "Europe/Moscow";

    @Column(name = "version", nullable = false)
    private long version = 1;

    /**
     * Дата создания.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Дата обновления.
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public OffsetDateTime getEndTime() {
        if (startTime == null) {
            return null;
        }
        return startTime.plusMinutes(Math.max(durationMinutes, 0));
    }
}
