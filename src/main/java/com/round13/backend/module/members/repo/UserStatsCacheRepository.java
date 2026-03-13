package com.round13.backend.module.members.repo;

import com.round13.backend.domain.UserStatsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Репозиторий для записи кеша points/statusLabel в user_stats.
 */
@Repository
public interface UserStatsCacheRepository extends JpaRepository<UserStatsEntity, UUID> {
}
