package com.round13.backend.module.loyalty.repo;

import com.round13.backend.module.loyalty.domain.LoyaltyPointTotalEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface LoyaltyPointTotalRepository extends JpaRepository<LoyaltyPointTotalEntity, UUID> {

    @Query("""
            select t
            from LoyaltyPointTotalEntity t
                join fetch t.member m
                left join fetch m.role r
            order by t.totalPoints desc, m.createdAt asc
            """)
    List<LoyaltyPointTotalEntity> findLeaderboard(Pageable pageable);
}
