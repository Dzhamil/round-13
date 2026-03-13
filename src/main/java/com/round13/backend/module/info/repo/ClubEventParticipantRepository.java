package com.round13.backend.module.info.repo;

import com.round13.backend.domain.ClubEventParticipantEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClubEventParticipantRepository extends JpaRepository<ClubEventParticipantEntity, UUID> {

    boolean existsByEvent_IdAndUser_Id(UUID eventId, UUID userId);

    Optional<ClubEventParticipantEntity> findByEvent_IdAndUser_Id(UUID eventId, UUID userId);

    @Query("""
            select p.event.id
            from ClubEventParticipantEntity p
            where p.user.id = :userId
              and p.event.id in :eventIds
            """)
    List<UUID> findJoinedEventIds(@Param("userId") UUID userId, @Param("eventIds") Collection<UUID> eventIds);

    @Query("""
            select p
            from ClubEventParticipantEntity p
                join fetch p.event e
                left join fetch e.createdBy a
            where p.user.id = :userId
              and e.endsAt >= :now
            order by e.startsAt asc
            """)
    List<ClubEventParticipantEntity> findMyEvents(@Param("userId") UUID userId, @Param("now") OffsetDateTime now);
}
