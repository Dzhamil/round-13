package com.round13.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * Новость клуба для главной страницы и контентного раздела.
 */
@Entity
@Table(name = "news_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NewsPostEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 256)
    private String title;

    @Column(length = 512)
    private String excerpt;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "is_published", nullable = false)
    private boolean published;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
