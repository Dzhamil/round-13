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
import java.util.Locale;

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

    private static final int CODE_MAX_LENGTH = 64;
    private static final int TITLE_MAX_LENGTH = 256;

    /**
     * Уникальный код страницы (например: about).
     */
    @Id
    @Column(name = "code", length = CODE_MAX_LENGTH, nullable = false, updatable = false)
    private String code;

    /**
     * Заголовок страницы.
     */
    @Column(name = "title", nullable = false, length = TITLE_MAX_LENGTH)
    private String title;

    /**
     * Основной текст страницы.
     */
    @Column(name = "content", nullable = false, columnDefinition = "text")
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

    public static String normalizeCode(String code) {
        if (code == null) {
            return "";
        }
        return code.trim().toLowerCase(Locale.ROOT);
    }
}
