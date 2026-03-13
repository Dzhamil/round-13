package com.round13.backend.module.user.repo;

import com.round13.backend.domain.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Репозиторий для работы с ролями пользователей.
 */
public interface RoleRepository extends JpaRepository<RoleEntity, Long> {

    /**
     * Возвращает роль по её коду.
     */
    Optional<RoleEntity> findByCode(String code);
}
