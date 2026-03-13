package com.round13.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * Информационная страница (например, "О нас").
 *
 * <p>Позволяет администратору редактировать текстовые разделы
 * без участия разработчика.</p>
 */
@Entity
@Table(name = "info_pages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InfoPageEntity {

    /**
     * Уникальный код страницы (например: about).
     */
    @Id
    @Column(length = 64, nullable = false, updatable = false)
    private String code;

    /**
     * Заголовок страницы.
     */
    @Column(nullable = false, length = 256)
    private String title;

    /**
     * Основной текст страницы.
     */
    @Column(nullable = false, columnDefinition = "text")
    private String content;

    /**
     * Дата создания записи.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Дата последнего обновления записи.
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
