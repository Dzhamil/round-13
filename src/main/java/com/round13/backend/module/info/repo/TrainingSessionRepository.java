package com.round13.backend.module.info.repo;

import com.round13.backend.domain.TrainingSessionEntity;
import com.round13.backend.domain.TrainingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Репозиторий тренировочных сессий (афиша + персональные тренировки).
 */
public interface TrainingSessionRepository extends JpaRepository<TrainingSessionEntity, UUID> {

    @Query("""
            select s
            from TrainingSessionEntity s
            left join fetch s.coach c
            where s.id = :id
            """)
    Optional<TrainingSessionEntity> findByIdWithCoach(@Param("id") UUID id);

    /**
     * Поиск тренировок по фильтрам.
     */
    @Query("""
            select s
            from TrainingSessionEntity s
            left join fetch s.coach c
            where (:type is null or s.type = :type)
              and (cast(:coachId as java.util.UUID) is null or c.id = :coachId)
              and (cast(:from as java.time.OffsetDateTime) is null or s.startTime >= :from)
              and (cast(:to as java.time.OffsetDateTime) is null or s.startTime < :to)
            order by s.startTime asc
            """)
    List<TrainingSessionEntity> search(
            @Param("type") TrainingType type,
            @Param("coachId") UUID coachId,
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to
    );

    /**
     * Расписание тренера (персональные тренировки).
     */
    @Query("""
            select s
            from TrainingSessionEntity s
            left join fetch s.coach c
            where c.id = :coachId
              and (cast(:from as java.time.OffsetDateTime) is null or s.startTime >= :from)
              and (cast(:to as java.time.OffsetDateTime) is null or s.startTime < :to)
            order by s.startTime asc
            """)
    List<TrainingSessionEntity> findCoachSchedule(
            @Param("coachId") UUID coachId,
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to
    );

    /**
     * Календарь месяца для тренера.
     */
    @Query("""
            select s
            from TrainingSessionEntity s
            left join fetch s.coach c
            where c.id = :coachId
              and s.startTime >= :monthStart
              and s.startTime < :monthEnd
            order by s.startTime asc
            """)
    List<TrainingSessionEntity> findCoachMonthSchedule(
            @Param("coachId") UUID coachId,
            @Param("monthStart") OffsetDateTime monthStart,
            @Param("monthEnd") OffsetDateTime monthEnd
    );

    /**
     * Получение сессий по списку id.
     */
    @Query("""
            select s
            from TrainingSessionEntity s
            left join fetch s.coach c
            where s.id in :ids
            """)
    List<TrainingSessionEntity> findAllWithCoachByIdIn(
            @Param("ids") List<UUID> ids
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
}
