package com.round13.backend.module.members.repo;

import com.round13.backend.domain.TrainingParticipantEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface TrainerStudentActivityRepository extends Repository<TrainingParticipantEntity, UUID> {
    String ACTIVE_STUDENT_TRAININGS = """
            select p from TrainingParticipantEntity p join fetch p.session s
            where p.user.id = :studentId and s.coach.id = :trainerId
              and s.schedule2Enabled = true and s.sheetImportActive = true
            """;

    @Query(ACTIVE_STUDENT_TRAININGS + " order by s.startTime desc")
    List<TrainingParticipantEntity> findHistory(@Param("studentId") UUID studentId,
                                              @Param("trainerId") UUID trainerId);

    @Query(ACTIVE_STUDENT_TRAININGS + " and s.startTime <= :now order by s.startTime desc")
    List<TrainingParticipantEntity> findRecent(@Param("studentId") UUID studentId,
            @Param("trainerId") UUID trainerId, @Param("now") OffsetDateTime now, Pageable limit);

    @Query(ACTIVE_STUDENT_TRAININGS + " and s.startTime >= :now order by s.startTime asc")
    List<TrainingParticipantEntity> findNext(@Param("studentId") UUID studentId,
            @Param("trainerId") UUID trainerId, @Param("now") OffsetDateTime now, Pageable limit);

    @Query(ACTIVE_STUDENT_TRAININGS + """
             and p.attendanceStatus = com.round13.backend.domain.AttendanceStatus.PRESENT
             and s.startTime <= :now order by s.startTime desc
            """)
    List<TrainingParticipantEntity> findLastAttended(@Param("studentId") UUID studentId,
            @Param("trainerId") UUID trainerId, @Param("now") OffsetDateTime now, Pageable limit);
}
