package com.round13.backend.module.shop.repo;

import com.round13.backend.domain.UserEntitlementEntity;
import com.round13.backend.domain.UserEntitlementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface UserEntitlementRepository extends JpaRepository<UserEntitlementEntity, UUID> {

    @Query("""
        select e
        from UserEntitlementEntity e
        where e.userId = :userId
          and e.type = :type
          and coalesce(e.remainingQuantity, e.quantity, 0) > 0
        order by e.createdAt desc
    """)
    List<UserEntitlementEntity> findActiveByUserIdAndType(UUID userId, UserEntitlementType type);
}
