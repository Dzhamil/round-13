package com.round13.backend.module.training.repo;

import com.round13.backend.domain.TrainingParticipantEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Репозиторий участников тренировок.
 */
public interface TrainingParticipantRepository extends JpaRepository<TrainingParticipantEntity, UUID> {

    /**
     * Проверяет, записан ли пользователь на тренировку.
     */
    boolean existsBySession_IdAndUser_Id(UUID sessionId, UUID userId);

    /**
     * Сколько участников записано на тренировку.
     */
    long countBySession_Id(UUID sessionId);

    /**
     * Найти запись участия пользователя.
     */
    Optional<TrainingParticipantEntity> findBySession_IdAndUser_Id(UUID sessionId, UUID userId);

    /**
     * Подсчёт участников по нескольким тренировкам.
     */
    @Query("""
            select p.session.id, count(p.id)
            from TrainingParticipantEntity p
            where p.session.id in :sessionIds
            group by p.session.id
            """)
    List<Object[]> countBySessionIds(@Param("sessionIds") Collection<UUID> sessionIds);

    /**
     * Моё расписание пользователя.
     */
    @Query("""
            select p
            from TrainingParticipantEntity p
                join fetch p.session s
                left join fetch s.coach c
            where p.user.id = :userId
              and (cast(:from as java.time.OffsetDateTime) is null or s.startTime >= :from)
              and (cast(:to as java.time.OffsetDateTime) is null or s.startTime < :to)
            order by s.startTime asc
            """)
    List<TrainingParticipantEntity> findMySchedule(
            @Param("userId") UUID userId,
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to
    );

    /**
     * Найти участников по списку тренировок.
     */
    List<TrainingParticipantEntity> findBySession_IdIn(Collection<UUID> sessionIds);

    @Query(value = """
            select exists(
                select 1
                from training_participants p
                join training_sessions s on s.id = p.session_id
                where p.user_id = :studentId
                  and s.start_time < :endTime
                  and (s.start_time + (s.duration_minutes * interval '1 minute')) > :startTime
            )
            """, nativeQuery = true)
    boolean existsStudentTimeConflict(
            @Param("studentId") UUID studentId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime
    );

}
