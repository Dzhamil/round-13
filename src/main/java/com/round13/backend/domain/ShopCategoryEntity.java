package com.round13.backend.domain;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
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
 * Категория магазина.
 */
@Entity
@Table(name = "shop_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShopCategoryEntity {

    private static final int TITLE_MAX_LENGTH = 128;
    private static final int DESCRIPTION_MAX_LENGTH = 2000;
    private static final int TYPE_MAX_LENGTH = 32;
    private static final int CONTENT_TYPE_MAX_LENGTH = 100;
    private static final ShopCategoryType DEFAULT_TYPE = ShopCategoryType.MERCH;
    private static final boolean DEFAULT_ACTIVE = true;

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "title", nullable = false, length = TITLE_MAX_LENGTH, unique = true)
    private String title;

    @Column(name = "description", nullable = false, length = DESCRIPTION_MAX_LENGTH)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = TYPE_MAX_LENGTH)
    private ShopCategoryType type = DEFAULT_TYPE;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "preview_image", columnDefinition = "bytea")
    private byte[] previewImage;

    @Column(name = "preview_image_content_type", length = CONTENT_TYPE_MAX_LENGTH)
    private String previewImageContentType;

    @Column(name = "is_active", nullable = false)
    private boolean active = DEFAULT_ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
