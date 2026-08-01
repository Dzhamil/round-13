package com.round13.backend.module.loyalty.repo;

import com.round13.backend.module.loyalty.domain.LoyaltyPointSourceType;
import com.round13.backend.module.loyalty.domain.LoyaltyScoringRuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LoyaltyScoringRuleRepository extends JpaRepository<LoyaltyScoringRuleEntity, UUID> {

    Optional<LoyaltyScoringRuleEntity> findByCodeAndEnabledTrueAndValidToIsNull(String code);

    List<LoyaltyScoringRuleEntity> findBySourceTypeAndEnabledTrueAndValidToIsNull(LoyaltyPointSourceType sourceType);
}
