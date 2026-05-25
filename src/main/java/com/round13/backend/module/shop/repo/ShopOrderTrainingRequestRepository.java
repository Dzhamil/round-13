package com.round13.backend.module.shop.repo;

import com.round13.backend.domain.ShopOrderTrainingRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ShopOrderTrainingRequestRepository extends JpaRepository<ShopOrderTrainingRequestEntity, UUID> {

    Optional<ShopOrderTrainingRequestEntity> findFirstByOrderItemOrderId(UUID orderId);
}
