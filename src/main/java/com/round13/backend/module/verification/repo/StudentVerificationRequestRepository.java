package com.round13.backend.module.verification.repo;

import com.round13.backend.domain.StudentVerificationRequestEntity;
import com.round13.backend.domain.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentVerificationRequestRepository extends JpaRepository<StudentVerificationRequestEntity, UUID> {
    Optional<StudentVerificationRequestEntity> findByStudentIdAndTrainerId(UUID studentId, UUID trainerId);
    List<StudentVerificationRequestEntity> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<StudentVerificationRequestEntity> findByTrainerIdAndStatusOrderByCreatedAtAsc(UUID trainerId, VerificationStatus status);
}
