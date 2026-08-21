package com.round13.backend.module.loyalty.repo;

import com.round13.backend.module.loyalty.domain.LoyaltyAchievementRuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LoyaltyAchievementRuleRepository extends JpaRepository<LoyaltyAchievementRuleEntity, UUID> {

    List<LoyaltyAchievementRuleEntity> findByEnabledTrueOrderBySortOrderAsc();

    Optional<LoyaltyAchievementRuleEntity> findByCodeAndEnabledTrue(String code);
}
