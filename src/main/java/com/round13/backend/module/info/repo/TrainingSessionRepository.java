package com.round13.backend.module.info.repo;

import com.round13.backend.domain.TrainingSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Репозиторий тренировочных сессий для расписания и персональных тренировок.
 */
public interface TrainingSessionRepository extends JpaRepository<TrainingSessionEntity, UUID> {

    /**
     * Расписание тренера (персональные тренировки).
     */
    @Query("""
            select s
            from TrainingSessionEntity s
            left join fetch s.coach c
            where c.id = :coachId
              and s.schedule2Enabled = false
              and (cast(:from as java.time.OffsetDateTime) is null or s.startTime >= :from)
              and (cast(:to as java.time.OffsetDateTime) is null or s.startTime < :to)
            order by s.startTime asc
            """)
    List<TrainingSessionEntity> findCoachSchedule(
            @Param("coachId") UUID coachId,
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to
    );

    @Query(value = """
            select exists(
                select 1
                from training_sessions s
                where s.coach_user_id = :coachId
                  and s.start_time < :endTime
                  and (s.start_time + (s.duration_minutes * interval '1 minute')) > :startTime
            )
            """, nativeQuery = true)
    boolean existsCoachTimeConflict(
            @Param("coachId") UUID coachId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime
    );

    @Query("""
            select distinct s from TrainingSessionEntity s
            left join fetch s.coach c
            where s.schedule2Enabled = true and c.id = :coachId
              and s.startTime >= :from and s.startTime < :to
            order by s.startTime asc
            """)
    List<TrainingSessionEntity> findSchedule2ByCoach(
            @Param("coachId") UUID coachId,
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to
    );

    @Query("""
            select s from TrainingSessionEntity s left join fetch s.coach c
            where s.id = :id and s.schedule2Enabled = true
            """)
    java.util.Optional<TrainingSessionEntity> findSchedule2ById(@Param("id") UUID id);

    @Query("select s from TrainingSessionEntity s left join fetch s.coach where s.schedule2Enabled = true order by s.startTime")
    List<TrainingSessionEntity> findAllSchedule2();
}
