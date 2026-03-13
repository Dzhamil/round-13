package com.round13.backend.module.members.service;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.members.dto.StudentTrainingActivityResponse;
import com.round13.backend.module.members.dto.TrainerStudentHistoryResponse;
import com.round13.backend.module.members.dto.TrainingBalanceHistoryItemResponse;
import com.round13.backend.module.members.mapper.TrainerStudentCardMapper;
import com.round13.backend.module.members.mapper.TrainingBalanceHistoryMapper;
import com.round13.backend.module.members.repo.TrainerStudentActivityRepository;
import com.round13.backend.module.members.repo.TrainingBalanceEventRepository;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainerStudentHistoryService {

    private final UserTrainerLinkRepository userTrainerLinkRepository;
    private final TrainerStudentActivityRepository trainerStudentActivityRepository;
    private final TrainingBalanceEventRepository trainingBalanceEventRepository;
    private final TrainerStudentCardMapper trainerStudentCardMapper;
    private final TrainingBalanceHistoryMapper trainingBalanceHistoryMapper;

    @Transactional(readOnly = true)
    public TrainerStudentHistoryResponse getHistory(UUID trainerId, UUID studentId) {
        ensureStudentBelongsToTrainer(trainerId, studentId);

        List<StudentTrainingActivityResponse> trainings = trainerStudentActivityRepository
                .findByUser_IdAndSession_Coach_IdOrderBySession_StartTimeDesc(studentId, trainerId)
                .stream()
                .map(trainerStudentCardMapper::toTrainingItem)
                .toList();

        List<TrainingBalanceHistoryItemResponse> balanceChanges = trainingBalanceEventRepository
                .findByTrainerIdAndStudentIdOrderByCreatedAtDesc(trainerId, studentId)
                .stream()
                .map(trainingBalanceHistoryMapper::toItem)
                .toList();

        return new TrainerStudentHistoryResponse(trainings, balanceChanges);
    }

    private void ensureStudentBelongsToTrainer(UUID trainerId, UUID studentId) {
        if (!userTrainerLinkRepository.existsByTrainerIdAndStudentId(trainerId, studentId)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
    }
}
