package com.round13.backend.module.members.service;

import com.round13.backend.module.members.dto.TrainingBalanceHistoryItemResponse;
import com.round13.backend.module.members.dto.TrainingBalanceHistoryResponse;
import com.round13.backend.module.members.dto.TrainingBalanceHistoryItemRow;
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

    @Transactional(readOnly = true)
    public TrainingBalanceHistoryResponse getHistory(UUID trainerId) {
        List<TrainingBalanceHistoryItemRow> rows = trainingBalanceEventRepository.findHistoryByTrainerId(trainerId);
        return new TrainingBalanceHistoryResponse(
                rows.stream()
                        .map(this::toItem)
                        .toList()
        );
    }

    private TrainingBalanceHistoryItemResponse toItem(TrainingBalanceHistoryItemRow row) {
        return new TrainingBalanceHistoryItemResponse(
                row.id() == null ? null : row.id().toString(),
                row.studentId() == null ? null : row.studentId().toString(),
                row.studentName(),
                row.delta() == null ? 0 : row.delta(),
                row.balanceAfter() == null ? 0 : row.balanceAfter(),
                row.eventType() == null ? null : row.eventType().name(),
                row.createdByUserId() == null ? null : row.createdByUserId().toString(),
                row.createdByName(),
                row.createdAt()
        );
    }
}
