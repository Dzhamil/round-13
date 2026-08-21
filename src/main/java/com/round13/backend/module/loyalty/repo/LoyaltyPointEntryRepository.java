package com.round13.backend.module.loyalty.repo;

import com.round13.backend.module.loyalty.domain.LoyaltyPointEntryEntity;
import com.round13.backend.module.loyalty.domain.LoyaltyPointSourceType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LoyaltyPointEntryRepository extends JpaRepository<LoyaltyPointEntryEntity, UUID> {

    Optional<LoyaltyPointEntryEntity> findByIdempotencyKey(String idempotencyKey);

    boolean existsByRevokedEntry_Id(UUID revokedEntryId);

    @Query("""
            select coalesce(sum(e.pointsDelta), 0),
                   coalesce(sum(case when e.pointsDelta > 0 then e.pointsDelta else 0 end), 0),
                   coalesce(sum(case when e.pointsDelta < 0 then e.pointsDelta else 0 end), 0)
            from LoyaltyPointEntryEntity e
            where e.member.id = :memberId
            """)
    Object[] sumTotals(@Param("memberId") UUID memberId);

    @Query("""
            select e
            from LoyaltyPointEntryEntity e
                left join fetch e.recordedByUser actor
            where e.member.id = :memberId
              and (cast(:before as java.time.OffsetDateTime) is null or e.eventDate < :before)
            order by e.eventDate desc, e.createdAt desc
            """)
    List<LoyaltyPointEntryEntity> findHistory(
            @Param("memberId") UUID memberId,
            @Param("before") OffsetDateTime before,
            Pageable pageable
    );

    @Query("""
            select e
            from LoyaltyPointEntryEntity e
                join fetch e.member m
                left join fetch e.recordedByUser actor
            where e.sourceType = :sourceType
              and e.sourceEntityId = :sourceEntityId
            order by e.createdAt desc
            """)
    List<LoyaltyPointEntryEntity> findBySource(
            @Param("sourceType") LoyaltyPointSourceType sourceType,
            @Param("sourceEntityId") UUID sourceEntityId
    );
}
