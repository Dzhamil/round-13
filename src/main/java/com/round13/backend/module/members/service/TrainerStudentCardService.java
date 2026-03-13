package com.round13.backend.module.members.service;

import com.round13.backend.domain.TrainingParticipantEntity;
import com.round13.backend.domain.TrainingParticipantStatus;
import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.module.members.dto.StudentOperationalStatusResponse;
import com.round13.backend.module.members.dto.StudentTrainingActivityResponse;
import com.round13.backend.module.members.dto.TrainerStudentCardResponse;
import com.round13.backend.module.members.dto.TrainerStudentNoteResponse;
import com.round13.backend.module.members.dto.TrainingBalanceHistoryItemResponse;
import com.round13.backend.module.members.mapper.TrainerStudentCardMapper;
import com.round13.backend.module.members.mapper.TrainingBalanceHistoryMapper;
import com.round13.backend.module.members.repo.TrainerStudentActivityRepository;
import com.round13.backend.module.members.repo.TrainingBalanceEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainerStudentCardService {

    private static final int RECENT_ITEMS_LIMIT = 3;

    private final TrainerStudentActivityRepository trainerStudentActivityRepository;
    private final TrainingBalanceEventRepository trainingBalanceEventRepository;
    private final TrainingBalanceHistoryMapper trainingBalanceHistoryMapper;
    private final TrainerStudentCardMapper trainerStudentCardMapper;
    private final TrainerStudentStatusResolver trainerStudentStatusResolver;
    private final MemberUserLabelResolver memberUserLabelResolver;

    @Transactional(readOnly = true)
    public TrainerStudentCardResponse buildCard(UUID trainerId, UUID studentId, UserTrainerLinkEntity link) {
        OffsetDateTime now = OffsetDateTime.now();

        List<StudentTrainingActivityResponse> recentTrainings = trainerStudentActivityRepository
                .findTop5ByUser_IdAndSession_Coach_IdOrderBySession_StartTimeDesc(studentId, trainerId)
                .stream()
                .limit(RECENT_ITEMS_LIMIT)
                .map(trainerStudentCardMapper::toTrainingItem)
                .toList();

        Optional<TrainingParticipantEntity> nextTrainingEntity = trainerStudentActivityRepository
                .findTopByUser_IdAndSession_Coach_IdAndStatusInAndSession_StartTimeGreaterThanEqualOrderBySession_StartTimeAsc(
                        studentId,
                        trainerId,
                        EnumSet.of(TrainingParticipantStatus.BOOKED, TrainingParticipantStatus.CANCEL_REQUESTED),
                        now
                );

        StudentTrainingActivityResponse nextTraining = nextTrainingEntity
                .map(trainerStudentCardMapper::toTrainingItem)
                .orElse(null);

        OffsetDateTime lastAttendedAt = trainerStudentActivityRepository
                .findTopByUser_IdAndSession_Coach_IdAndStatusOrderBySession_StartTimeDesc(
                        studentId,
                        trainerId,
                        TrainingParticipantStatus.ATTENDED
                )
                .map(participant -> participant.getSession().getStartTime())
                .orElse(null);

        StudentOperationalStatusResponse operationalStatus = trainerStudentStatusResolver.resolve(
                link,
                lastAttendedAt,
                nextTrainingEntity.orElse(null),
                now
        );

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
