package com.round13.backend.module.rule.repo;

import com.round13.backend.domain.RuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Репозиторий правил клуба.
 */
public interface RuleRepository extends JpaRepository<RuleEntity, UUID> {

    /**
     * Проверяет существование правила по коду.
     */
    boolean existsByCode(String code);

    /**
     * Возвращает все правила в порядке отображения.
     */
    List<RuleEntity> findAllByOrderBySortOrderAsc();
}
