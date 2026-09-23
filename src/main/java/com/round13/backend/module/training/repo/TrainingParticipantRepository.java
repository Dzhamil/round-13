package com.round13.backend.module.training.repo;

import com.round13.backend.domain.TrainingParticipantEntity;
import com.round13.backend.domain.TrainingParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Репозиторий участников тренировок.
 */
public interface TrainingParticipantRepository extends JpaRepository<TrainingParticipantEntity, UUID> {

    long countByUser_IdAndStatus(UUID userId, TrainingParticipantStatus status);

    @Query("""
            select count(p)
            from TrainingParticipantEntity p
            where p.user.id = :userId
              and (
                    p.status = com.round13.backend.domain.TrainingParticipantStatus.NO_SHOW
                    or (
                        p.status = com.round13.backend.domain.TrainingParticipantStatus.CANCELLED_LATE
                        and p.chargedAt is not null
                    )
              )
            """)
    long countMissedForStats(@Param("userId") UUID userId);

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
     * Найти участников по списку тренировок.
     */
    List<TrainingParticipantEntity> findBySession_IdIn(Collection<UUID> sessionIds);

    @Query("""
            select p from TrainingParticipantEntity p
            join fetch p.user u left join fetch u.role
            where p.session.id = :sessionId
            order by p.createdAt asc
            """)
    List<TrainingParticipantEntity> findSchedule2Participants(@Param("sessionId") UUID sessionId);

}
