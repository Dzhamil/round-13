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
 * Правило клуба (текстовый материал).
 */
@Entity
@Table(name = "rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RuleEntity {

    private static final int CODE_MAX_LENGTH = 64;
    private static final int TITLE_MAX_LENGTH = 256;

    /**
     * Идентификатор правила.
     */
    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    /**
     * Код правила (уникальный).
     */
    @Column(name = "code", nullable = false, unique = true, length = CODE_MAX_LENGTH)
    private String code;

    /**
     * Заголовок правила.
     */
    @Column(name = "title", nullable = false, length = TITLE_MAX_LENGTH)
    private String title;

    /**
     * Текст правила (может содержать пункты).
     */
    @Column(name = "content", nullable = false, columnDefinition = "text")
    private String content;

    /**
     * Порядок отображения.
     */
    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    /**
     * Дата создания.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Дата обновления.
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
