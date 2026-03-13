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
 * Категория магазина.
 */
@Entity
@Table(name = "shop_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShopCategoryEntity {

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, length = 128, unique = true)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 32)
    private ShopCategoryType type = ShopCategoryType.MERCH;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "preview_image", columnDefinition = "bytea")
    private byte[] previewImage;

    @Column(name = "preview_image_content_type", length = 100)
    private String previewImageContentType;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
