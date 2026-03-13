package com.round13.backend.module.shop.repo;

import com.round13.backend.domain.UserEntitlementEventEntity;
import com.round13.backend.module.profile.dto.ProfileGroupEntitlementActivityRow;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface UserEntitlementEventRepository extends JpaRepository<UserEntitlementEventEntity, UUID> {

    @Query("""
            select new com.round13.backend.module.profile.dto.ProfileGroupEntitlementActivityRow(
                e.id,
                e.type,
                coalesce(entitlement.note, e.note),
                clubEvent.title,
                e.delta,
                e.balanceAfter,
                e.createdAt
            )
            from UserEntitlementEventEntity e
            join UserEntitlementEntity entitlement on entitlement.id = e.entitlementId
            left join ClubEventEntity clubEvent on clubEvent.id = e.clubEventId
            where e.userId = :userId
            order by e.createdAt desc
            """)
    List<ProfileGroupEntitlementActivityRow> findRecentByUserId(UUID userId, Pageable pageable);
}
