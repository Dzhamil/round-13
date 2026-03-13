package com.round13.backend.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Товар или услуга в магазине.
 */
@Entity
@Table(name = "shop_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShopProductEntity {

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    /** Стабильный код товара (для фронта и интеграций). */
    @Column(nullable = false, unique = true, length = 64)
    private String code;

    /** Название товара. */
    @Column(nullable = false, length = 256)
    private String title;

    /** Описание товара (опционально). */
    @Column(columnDefinition = "text")
    private String description;

    /** Ссылка на категорию. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private ShopCategoryEntity category;

    /** Цена за единицу в минимальных денежных единицах (копейки/центы). */
    @Column(name = "price_amount", nullable = false)
    private int priceAmount;

    /** Валюта (по умолчанию RUB). */
    @Column(nullable = false, length = 8)
    private String currency;

    /** Бинарное изображение товара. */
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "image_data", columnDefinition = "bytea")
    private byte[] imageData;

    /** Content-Type бинарного изображения товара. */
    @Column(name = "image_content_type", length = 100)
    private String imageContentType;

    /** Признак активности товара в каталоге. */
    @Column(name = "is_active", nullable = false)
    private boolean active;

    /** Порядок сортировки в каталоге. */
    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
