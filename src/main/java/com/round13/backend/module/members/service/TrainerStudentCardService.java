package com.round13.backend.module.members.service;

import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.module.members.dto.StudentOperationalStatusResponse;
import com.round13.backend.module.members.dto.StudentTrainingActivityResponse;
import com.round13.backend.module.members.dto.TrainerStudentCardResponse;
import com.round13.backend.module.members.dto.TrainerStudentNoteResponse;
import com.round13.backend.module.members.dto.TrainingBalanceHistoryItemResponse;
import com.round13.backend.module.members.mapper.TrainerStudentCardMapper;
import com.round13.backend.module.members.mapper.TrainingBalanceHistoryMapper;
import com.round13.backend.module.members.repo.TrainingBalanceEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainerStudentCardService {

    private static final int RECENT_ITEMS_LIMIT = 3;

    private final TrainingBalanceEventRepository trainingBalanceEventRepository;
    private final TrainingBalanceHistoryMapper trainingBalanceHistoryMapper;
    private final TrainerStudentCardMapper trainerStudentCardMapper;
    private final TrainerStudentStatusResolver trainerStudentStatusResolver;
    private final MemberUserLabelResolver memberUserLabelResolver;

    @Transactional(readOnly = true)
    public TrainerStudentCardResponse buildCard(UUID trainerId, UUID studentId, UserTrainerLinkEntity link) {
        // No attendance history is carried over from the retired schedule.
        List<StudentTrainingActivityResponse> recentTrainings = List.of();
        StudentTrainingActivityResponse nextTraining = null;
        StudentOperationalStatusResponse operationalStatus = trainerStudentStatusResolver.resolve(link);

        List<TrainingBalanceHistoryItemResponse> recentBalanceChanges = trainingBalanceEventRepository
                .findTop5ByTrainerIdAndStudentIdOrderByCreatedAtDesc(
                        trainerId,
                        studentId,
                        PageRequest.of(0, RECENT_ITEMS_LIMIT)
                )
                .stream()
                .map(trainingBalanceHistoryMapper::toItem)
                .toList();

        TrainerStudentNoteResponse note = trainerStudentCardMapper.toNote(
                link,
                memberUserLabelResolver.resolveByUserId(link.getCoachNoteUpdatedByUserId())
        );

        return trainerStudentCardMapper.toCard(
                operationalStatus,
                note,
                nextTraining,
                recentTrainings,
                recentBalanceChanges
        );
    }
}
