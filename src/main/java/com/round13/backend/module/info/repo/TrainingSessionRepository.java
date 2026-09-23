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
    List<TrainingSessionEntity> findBySheetImportSpreadsheetIdAndCoach_Id(String spreadsheetId, UUID coachId);


    @Query("""
            select distinct s from TrainingSessionEntity s
            left join fetch s.coach c
            where s.schedule2Enabled = true and s.sheetImportActive = true and c.id = :coachId
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
            where s.id = :id and s.schedule2Enabled = true and s.sheetImportActive = true
            """)
    java.util.Optional<TrainingSessionEntity> findSchedule2ById(@Param("id") UUID id);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from TrainingSessionEntity s where s.id = :id and s.schedule2Enabled = true and s.sheetImportActive = true")
    java.util.Optional<TrainingSessionEntity> findSchedule2ForUpdate(@Param("id") UUID id);

    @Query("select s from TrainingSessionEntity s left join fetch s.coach where s.schedule2Enabled = true and s.sheetImportActive = true order by s.startTime")
    List<TrainingSessionEntity> findAllSchedule2();
}
