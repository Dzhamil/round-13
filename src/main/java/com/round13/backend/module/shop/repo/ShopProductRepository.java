package com.round13.backend.module.shop.repo;

import com.round13.backend.domain.ShopProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Репозиторий товаров магазина.
 */
public interface ShopProductRepository extends JpaRepository<ShopProductEntity, UUID> {

    /**
     * Возвращает активный товар по коду.
     */
    Optional<ShopProductEntity> findByCodeAndActiveTrue(String code);

    /**
     * Возвращает список активных товаров каталога с фильтром по категории.
     *
     * @param categoryId идентификатор категории (или null для всех)
     */
    @Query("""
            select p
            from ShopProductEntity p
            where p.active = true
              and p.category.active = true
              and (:categoryId is null or p.category.id = :categoryId)
            order by p.sortOrder asc, p.title asc
            """)
    List<ShopProductEntity> findActiveCatalog(@Param("categoryId") UUID categoryId);

    /**
     * Проверяет существование товара с таким кодом.
     */
    boolean existsByCode(String code);

    /**
     * Массовая деактивация товаров по категории.
     */
    @Modifying
    @Query("update ShopProductEntity p set p.active = false where p.category.id = :categoryId")
    int deactivateByCategoryId(@Param("categoryId") UUID categoryId);
}
