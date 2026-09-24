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

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Запись участия пользователя в тренировочной сессии.
 */
@Entity
@Table(name = "training_participants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrainingParticipantEntity {

    /**
     * Идентификатор записи участия.
     */
    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    /**
     * Тренировочная сессия.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private TrainingSessionEntity session;

    /**
     * Пользователь — участник тренировки.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(name = "attendance_status", nullable = false, length = 16)
    private AttendanceStatus attendanceStatus = AttendanceStatus.ABSENT;

    /** Payment imported from the sheet for this session/user; never trainer-editable. */
    @Column(name = "sheet_import_paid", nullable = false)
    private boolean sheetImportPaid;

    @Column(name = "sheet_import_created", nullable = false)
    private boolean sheetImportCreated;

    @Column(name = "attendance_marked_at")
    private OffsetDateTime attendanceMarkedAt;

    @Column(name = "attendance_marked_by_user_id")
    private UUID attendanceMarkedByUserId;

    @Column(name = "attendance_comment", columnDefinition = "text")
    private String attendanceComment;

    @Column(name = "attendance_updated_at")
    private OffsetDateTime attendanceUpdatedAt;

    @Column(name = "attendance_version", nullable = false)
    private long attendanceVersion;

    /**
     * Дата и время записи пользователя на тренировку.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
