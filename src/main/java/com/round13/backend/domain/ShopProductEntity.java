package com.round13.backend.domain;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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

    public static final String DEFAULT_CURRENCY = "RUB";

    private static final int CODE_MAX_LENGTH = 64;
    private static final int TITLE_MAX_LENGTH = 256;
    private static final int CURRENCY_MAX_LENGTH = 8;
    private static final int IMAGE_CONTENT_TYPE_MAX_LENGTH = 100;
    private static final int ENTITLEMENT_TYPE_MAX_LENGTH = 32;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /** Стабильный код товара (для фронта и интеграций). */
    @Column(name = "code", nullable = false, unique = true, length = CODE_MAX_LENGTH)
    private String code;

    /** Название товара. */
    @Column(name = "title", nullable = false, length = TITLE_MAX_LENGTH)
    private String title;

    /** Описание товара (опционально). */
    @Column(name = "description", columnDefinition = "text")
    private String description;

    /** Ссылка на категорию. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private ShopCategoryEntity category;

    /** Цена за единицу в минимальных денежных единицах (копейки/центы). */
    @Column(name = "price_amount", nullable = false)
    private int priceAmount;

    /** Валюта (по умолчанию RUB). */
    @Column(name = "currency", nullable = false, length = CURRENCY_MAX_LENGTH)
    private String currency;

    /** Бинарное изображение товара. */
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "image_data", columnDefinition = "bytea")
    private byte[] imageData;

    /** Content-Type бинарного изображения товара. */
    @Column(name = "image_content_type", length = IMAGE_CONTENT_TYPE_MAX_LENGTH)
    private String imageContentType;

    /** Признак активности товара в каталоге. */
    @Column(name = "is_active", nullable = false)
    private boolean active;

    /** Порядок сортировки в каталоге. */
    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    /** Тип активируемой услуги для тренировочного продукта. */
    @Enumerated(EnumType.STRING)
    @Column(name = "entitlement_type", length = ENTITLEMENT_TYPE_MAX_LENGTH)
    private UserEntitlementType entitlementType;

    /** Сколько тренировок начисляется за одну единицу товара. */
    @Column(name = "entitlement_quantity")
    private Integer entitlementQuantity;

    /** Тренер для персонального пакета, если продукт привязан к конкретному тренеру. */
    @Column(name = "trainer_id")
    private UUID trainerId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
