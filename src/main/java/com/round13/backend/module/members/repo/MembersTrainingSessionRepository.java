package com.round13.backend.module.members.repo;

import com.round13.backend.domain.TrainingSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Read-only репозиторий для подсчёта тренерских метрик по тренировочным сессиям.
 */
public interface MembersTrainingSessionRepository extends JpaRepository<TrainingSessionEntity, UUID> {

    /**
     * Считает количество тренировок, где пользователь указан тренером, и тренировка уже началась.
     */
    @Query("""
            select count(s.id)
            from TrainingSessionEntity s
            where s.coach.id = :coachId
              and s.startTime < :now
            """)
    long countConductedTrainings(
            @Param("coachId") UUID coachId,
            @Param("now") OffsetDateTime now
    );
}
