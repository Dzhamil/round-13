package com.round13.backend.module.members.service;

import com.round13.backend.domain.TrainingBalanceEventEntity;
import com.round13.backend.domain.TrainingBalanceEventType;
import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.module.members.repo.TrainingBalanceEventRepository;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TrainingBalanceService {

    private final UserTrainerLinkRepository userTrainerLinkRepository;
    private final TrainingBalanceEventRepository trainingBalanceEventRepository;

    public boolean debitOneIfPossible(UUID trainerId, UUID studentId, TrainingBalanceEventType eventType, UUID createdByUserId) {
        Optional<UserTrainerLinkEntity> maybeLink = userTrainerLinkRepository.findByTrainerIdAndStudentId(trainerId, studentId);
        if (maybeLink.isEmpty()) {
            return false;
        }

        UserTrainerLinkEntity link = maybeLink.get();
        int currentBalance = link.getRemainingTrainings();
        if (currentBalance <= 0) {
            return false;
        }

        int nextBalance = currentBalance - 1;
        link.setRemainingTrainings(nextBalance);
        userTrainerLinkRepository.save(link);

        TrainingBalanceEventEntity event = new TrainingBalanceEventEntity();
        event.setTrainerId(trainerId);
        event.setStudentId(studentId);
        event.setDelta(-1);
        event.setBalanceAfter(nextBalance);
        event.setEventType(eventType);
        event.setCreatedByUserId(createdByUserId);
        trainingBalanceEventRepository.save(event);

        return true;
    }
}
