package com.round13.backend.module.loyalty.repo;

import com.round13.backend.module.loyalty.domain.LoyaltyRankRuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LoyaltyRankRuleRepository extends JpaRepository<LoyaltyRankRuleEntity, UUID> {

    List<LoyaltyRankRuleEntity> findByEnabledTrueOrderByMinPointsAscSortOrderAsc();

    Optional<LoyaltyRankRuleEntity> findByCodeAndEnabledTrue(String code);
}
