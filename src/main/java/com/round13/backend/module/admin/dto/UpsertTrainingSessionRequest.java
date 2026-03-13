package com.round13.backend.module.admin.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Запрос на создание/обновление тренировки (админ/тренер).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpsertTrainingSessionRequest {

    /**
     * Название тренировки/мероприятия.
     */
    @NotBlank
    @Size(max = 256)
    private String title;

    /**
     * Описание (опционально).
     */
    @Size(max = 5000)
    private String description;

    /**
     * Тип тренировки: GROUP / PERSONAL / OPEN.
     *
     * <p>Передаём строкой, чтобы не ломать контракт при возможных изменениях.</p>
     */
    @NotBlank
    @Size(max = 16)
    private String type;

    /**
     * Дата и время начала.
     */
    @NotNull
    @Future
    private OffsetDateTime startTime;

    /**
     * Длительность в минутах.
     */
    @Positive
    private int durationMinutes;

    /**
     * Вместимость (null = без лимита).
     */
    private Integer capacity;

    /**
     * Место проведения (опционально).
     */
    @Size(max = 256)
    private String location;

    /**
     * Тренер/организатор (опционально).
     *
     * <p>Если не задан — тренировка считается без привязки к тренеру.</p>
     */
    private UUID coachUserId;
}
