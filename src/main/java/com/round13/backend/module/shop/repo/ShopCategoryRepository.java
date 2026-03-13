package com.round13.backend.module.shop.repo;

import com.round13.backend.domain.ShopCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Репозиторий для категорий магазина.
 */
public interface ShopCategoryRepository extends JpaRepository<ShopCategoryEntity, UUID> {

    /**
     * Найти все активные категории, отсортированные по названию.
     */
    List<ShopCategoryEntity> findByActiveTrueOrderByTitleAsc();

    /**
     * Проверка уникальности названия категории.
     */
    boolean existsByTitle(String title);
}
