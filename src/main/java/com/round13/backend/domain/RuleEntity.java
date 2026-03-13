package com.round13.backend.domain;

import jakarta.persistence.*;
import lombok.*;
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

    /**
     * Идентификатор правила.
     */
    @Id
    @GeneratedValue
    private UUID id;

    /**
     * Код правила (уникальный).
     */
    @Column(nullable = false, unique = true, length = 64)
    private String code;

    /**
     * Заголовок правила.
     */
    @Column(nullable = false, length = 256)
    private String title;

    /**
     * Текст правила (может содержать пункты).
     */
    @Column(nullable = false, columnDefinition = "text")
    private String content;

    /**
     * Порядок отображения.
     */
    @Column(nullable = false)
    private int sortOrder;

    /**
     * Дата создания.
     */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Дата обновления.
     */
    @UpdateTimestamp
    @Column(nullable = false)
    private OffsetDateTime updatedAt;
}
