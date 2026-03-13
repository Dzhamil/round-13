package com.round13.backend.module.training.service;

import com.round13.backend.domain.TrainingParticipantEntity;
import com.round13.backend.module.training.dto.MyScheduleItemResponse;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.training.mapper.MyScheduleMapper;
import com.round13.backend.module.training.repo.TrainingParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Сервис "Моё расписание".
 */
@Service
@RequiredArgsConstructor
public class MyScheduleService {

    private final TrainingParticipantRepository trainingParticipantRepository;
    private final MyScheduleMapper myScheduleMapper;
    private final TrainingParticipationService trainingParticipationService;
    /**
     * "Моё расписание": тренировки, на которые записан текущий пользователь.
     *
     * @param userId текущий пользователь
     * @param from   начало диапазона (включительно), nullable
     * @param to     конец диапазона (исключительно), nullable
     */
    @Transactional(readOnly = true)
    public List<MyScheduleItemResponse> getMySchedule(UUID userId, OffsetDateTime from, OffsetDateTime to) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        if (from != null && to != null && !from.isBefore(to)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        List<TrainingParticipantEntity> participations = trainingParticipantRepository.findMySchedule(userId, from, to);

        OffsetDateTime now = OffsetDateTime.now();
        return participations.stream()
                .map(participation -> myScheduleMapper.toItem(participation, now))
                .toList();
    }

    @Transactional
    public void requestCancellation(UUID userId, UUID sessionId) {
        trainingParticipationService.requestCancellation(userId, sessionId);
    }
}
