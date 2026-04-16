package com.round13.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * Связь "тренер -> ученик".
 * По этой таблице считаем studentsCount в карточке тренера.
 */
@Entity
@Table(name = "user_trainer_links")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserTrainerLinkEntity {

    public static final int DEFAULT_REMAINING_TRAININGS = 0;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "remaining_trainings", nullable = false)
    private int remainingTrainings = DEFAULT_REMAINING_TRAININGS;

    @Column(name = "coach_note", columnDefinition = "text")
    private String coachNote;

    @Column(name = "coach_note_updated_at")
    private OffsetDateTime coachNoteUpdatedAt;

    @Column(name = "coach_note_updated_by_user_id")
    private UUID coachNoteUpdatedByUserId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
