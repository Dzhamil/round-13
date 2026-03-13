package com.round13.backend.module.members.service;

import com.round13.backend.module.members.dto.TrainingBalanceHistoryResponse;
import com.round13.backend.module.members.dto.TrainingBalanceHistoryItemRow;
import com.round13.backend.module.members.mapper.TrainingBalanceHistoryMapper;
import com.round13.backend.module.members.repo.TrainingBalanceEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainingBalanceHistoryService {

    private final TrainingBalanceEventRepository trainingBalanceEventRepository;
    private final TrainingBalanceHistoryMapper trainingBalanceHistoryMapper;

    @Transactional(readOnly = true)
    public TrainingBalanceHistoryResponse getHistory(UUID trainerId) {
        List<TrainingBalanceHistoryItemRow> rows = trainingBalanceEventRepository.findHistoryByTrainerId(trainerId);
        return new TrainingBalanceHistoryResponse(
                rows.stream()
                        .map(trainingBalanceHistoryMapper::toItem)
                        .toList()
        );
    }
}
