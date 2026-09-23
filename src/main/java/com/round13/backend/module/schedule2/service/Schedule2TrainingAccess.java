package com.round13.backend.module.schedule2.service;

import com.round13.backend.domain.TrainingSessionEntity;
import com.round13.backend.module.info.repo.TrainingSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class Schedule2TrainingAccess {
    private final TrainingSessionRepository sessions;

    public TrainingSessionEntity ownedForUpdate(UUID trainingId, UUID trainerId) {
        var training = sessions.findSchedule2ForUpdate(trainingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Тренировка не найдена"));
        if (training.getCoach() == null || !trainerId.equals(training.getCoach().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Доступно только расписание текущего тренера");
        }
        return training;
    }
}
