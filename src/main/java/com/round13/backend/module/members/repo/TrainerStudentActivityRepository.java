package com.round13.backend.module.members.repo;

import com.round13.backend.domain.TrainingParticipantEntity;
import com.round13.backend.domain.TrainingParticipantStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TrainerStudentActivityRepository extends JpaRepository<TrainingParticipantEntity, UUID> {

    @EntityGraph(attributePaths = {"session"})
    List<TrainingParticipantEntity> findTop5ByUser_IdAndSession_Coach_IdOrderBySession_StartTimeDesc(
            UUID studentId,
            UUID trainerId
    );

    @EntityGraph(attributePaths = {"session"})
    List<TrainingParticipantEntity> findByUser_IdAndSession_Coach_IdOrderBySession_StartTimeDesc(
            UUID studentId,
            UUID trainerId
    );

    @EntityGraph(attributePaths = {"session"})
    Optional<TrainingParticipantEntity> findTopByUser_IdAndSession_Coach_IdAndStatusOrderBySession_StartTimeDesc(
            UUID studentId,
            UUID trainerId,
            TrainingParticipantStatus status
    );

    @EntityGraph(attributePaths = {"session"})
    Optional<TrainingParticipantEntity> findTopByUser_IdAndSession_Coach_IdAndStatusInAndSession_StartTimeGreaterThanEqualOrderBySession_StartTimeAsc(
            UUID studentId,
            UUID trainerId,
            Collection<TrainingParticipantStatus> statuses,
            OffsetDateTime startTime
    );
}
