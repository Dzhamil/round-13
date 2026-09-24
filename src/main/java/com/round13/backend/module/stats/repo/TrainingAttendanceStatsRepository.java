package com.round13.backend.module.stats.repo;

import com.round13.backend.domain.AttendanceStatus;
import com.round13.backend.domain.TrainingParticipantEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.UUID;

public interface TrainingAttendanceStatsRepository extends Repository<TrainingParticipantEntity, UUID> {
    /** Initial ABSENT is not a missed training until the active session has ended. */
    @Query("""
            select count(p) from TrainingParticipantEntity p join p.session s
            where p.user.id = :userId and p.attendanceStatus = :attendance
              and s.schedule2Enabled = true and s.sheetImportActive = true
              and timestampadd(minute, s.durationMinutes, s.startTime) <= :now
            """)
    long countCompleted(@Param("userId") UUID userId, @Param("attendance") AttendanceStatus attendance,
                        @Param("now") OffsetDateTime now);
}
