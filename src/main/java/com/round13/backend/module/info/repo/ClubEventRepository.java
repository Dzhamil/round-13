package com.round13.backend.module.info.repo;

import com.round13.backend.domain.ClubEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface ClubEventRepository extends JpaRepository<ClubEventEntity, UUID> {

    @Query("""
            select e
            from ClubEventEntity e
            join fetch e.createdBy
            left join fetch e.trainer
            where e.endsAt >= :now
            order by e.startsAt asc, e.createdAt asc
            """)
    List<ClubEventEntity> findUpcoming(@Param("now") OffsetDateTime now);
}
