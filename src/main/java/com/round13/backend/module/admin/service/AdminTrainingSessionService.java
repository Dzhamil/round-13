package com.round13.backend.module.admin.service;

import com.round13.backend.domain.TrainingSessionEntity;
import com.round13.backend.module.admin.dto.UpsertTrainingSessionRequest;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.info.mapper.TrainingSessionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Административный сервис управления тренировочными сессиями.
 */
@Service
@RequiredArgsConstructor
public class AdminTrainingSessionService {

    private final TrainingSessionRepository sessionRepository;
    private final TrainingSessionMapper trainingSessionMapper;

    /**
     * Создаёт новую тренировку.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UUID create(UpsertTrainingSessionRequest request) {
        TrainingSessionEntity entity = new TrainingSessionEntity();
        trainingSessionMapper.apply(request, entity);

        sessionRepository.save(entity);
        return entity.getId();
    }

    /**
     * Обновляет существующую тренировку.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void update(UUID sessionId, UpsertTrainingSessionRequest request) {
        TrainingSessionEntity entity = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));

        if (OffsetDateTime.now().isAfter(entity.getStartTime())) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_STARTED);
        }

        trainingSessionMapper.apply(request, entity);
        sessionRepository.save(entity);
    }

    /**
     * Удаляет тренировку.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void delete(UUID sessionId) {
        TrainingSessionEntity entity = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));

        if (OffsetDateTime.now().isAfter(entity.getStartTime())) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_STARTED);
        }

        sessionRepository.delete(entity);
    }
}
