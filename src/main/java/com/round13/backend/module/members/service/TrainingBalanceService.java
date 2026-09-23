package com.round13.backend.module.members.service;

import com.round13.backend.domain.TrainingBalanceEventEntity;
import com.round13.backend.domain.TrainingBalanceEventType;
import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.members.dto.TrainingBalanceChangeCommand;
import com.round13.backend.module.members.mapper.TrainingBalanceChangeCommandMapper;
import com.round13.backend.module.members.mapper.TrainingBalanceEventMapper;
import com.round13.backend.module.members.mapper.UserTrainerLinkMapper;
import com.round13.backend.module.members.repo.TrainingBalanceEventRepository;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TrainingBalanceService {

    private static final int ZERO_BALANCE = 0;

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

    public int setRemainingTrainings(UUID trainerId, UUID studentId, int remainingTrainings, UUID createdByUserId) {
        UserTrainerLinkEntity link = userTrainerLinkRepository.findByTrainerIdAndStudentId(trainerId, studentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REQUEST));

        int currentBalance = link.getRemainingTrainings();
        int delta = remainingTrainings - currentBalance;
        if (delta == 0) {
            return remainingTrainings;
        }

        link.setRemainingTrainings(remainingTrainings);
        userTrainerLinkRepository.save(link);

        TrainingBalanceChangeCommand command = trainingBalanceChangeCommandMapper.toCommand(
                trainerId,
                studentId,
                Math.abs(delta),
                TrainingBalanceEventType.manualAdjustmentForDelta(delta),
                createdByUserId
        );
        saveEvent(command, delta, remainingTrainings);

        return remainingTrainings;
    }

    private void saveEvent(TrainingBalanceChangeCommand command, int delta, int balanceAfter) {
        TrainingBalanceEventEntity event = trainingBalanceEventMapper.toEntity(command, delta, balanceAfter);
        trainingBalanceEventRepository.save(event);
    }
}
