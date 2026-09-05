package com.round13.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_verification_requests")
@Getter @Setter @NoArgsConstructor
public class StudentVerificationRequestEntity {
    @Id @GeneratedValue
    private UUID id;
    @Column(name = "student_id", nullable = false)
    private UUID studentId;
    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;
    @Column(name = "training_types", nullable = false, length = 128)
    private String trainingTypes;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private VerificationStatus status = VerificationStatus.PENDING;
    @Column(name = "data_confirmed", nullable = false)
    private boolean dataConfirmed;
    @Column(name = "relationship_confirmed", nullable = false)
    private boolean relationshipConfirmed;
    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;
    @Column(name = "reviewed_by_user_id")
    private UUID reviewedByUserId;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
