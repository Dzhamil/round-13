package com.round13.backend.module.members.service;

import com.round13.backend.domain.TrainingBalanceEventEntity;
import com.round13.backend.domain.TrainingBalanceEventType;
import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.module.members.dto.TrainingBalanceChangeCommand;
import com.round13.backend.module.members.mapper.TrainingBalanceChangeCommandMapper;
import com.round13.backend.module.members.mapper.TrainingBalanceEventMapper;
import com.round13.backend.module.members.mapper.UserTrainerLinkMapper;
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

    private static final int ZERO_BALANCE = 0;
    private static final int SINGLE_TRAINING_DEBIT = 1;

    private final UserTrainerLinkRepository userTrainerLinkRepository;
    private final TrainingBalanceEventRepository trainingBalanceEventRepository;
    private final TrainingBalanceChangeCommandMapper trainingBalanceChangeCommandMapper;
    private final TrainingBalanceEventMapper trainingBalanceEventMapper;
    private final UserTrainerLinkMapper userTrainerLinkMapper;

    public int creditTrainings(TrainingBalanceChangeCommand command) {
        if (command.quantity() <= ZERO_BALANCE) {
            return ZERO_BALANCE;
        }

        UserTrainerLinkEntity link = userTrainerLinkRepository
                .findByTrainerIdAndStudentId(command.trainerId(), command.studentId())
                .orElseGet(() -> userTrainerLinkMapper.create(command));

        int nextBalance = Math.addExact(link.getRemainingTrainings(), command.quantity());
        link.setRemainingTrainings(nextBalance);
        userTrainerLinkRepository.save(link);
        saveEvent(command, command.quantity(), nextBalance);

        return nextBalance;
    }

    public boolean debitOneIfPossible(UUID trainerId, UUID studentId, TrainingBalanceEventType eventType, UUID createdByUserId) {
        Optional<UserTrainerLinkEntity> maybeLink = userTrainerLinkRepository.findByTrainerIdAndStudentId(trainerId, studentId);
        if (maybeLink.isEmpty()) {
            return false;
        }

        UserTrainerLinkEntity link = maybeLink.get();
        int currentBalance = link.getRemainingTrainings();
        if (currentBalance <= ZERO_BALANCE) {
            return false;
        }

        int nextBalance = currentBalance - SINGLE_TRAINING_DEBIT;
        link.setRemainingTrainings(nextBalance);
        userTrainerLinkRepository.save(link);
        TrainingBalanceChangeCommand command = trainingBalanceChangeCommandMapper.toCommand(
                        trainerId,
                        studentId,
                        SINGLE_TRAINING_DEBIT,
                        eventType,
                        createdByUserId
        );
        saveEvent(command, -SINGLE_TRAINING_DEBIT, nextBalance);

        return true;
    }

    private void saveEvent(TrainingBalanceChangeCommand command, int delta, int balanceAfter) {
        TrainingBalanceEventEntity event = trainingBalanceEventMapper.toEntity(command, delta, balanceAfter);
        trainingBalanceEventRepository.save(event);
    }
}
