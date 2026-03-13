package com.round13.backend.module.training.service;

import com.round13.backend.domain.ClubEventEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.info.ClubEventTypeCodes;
import com.round13.backend.module.info.mapper.ClubEventMapper;
import com.round13.backend.module.info.repo.ClubEventRepository;
import com.round13.backend.module.training.dto.CreateCoachTrainingEventRequest;
import com.round13.backend.module.user.UserRoleCodes;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainerClubEventService {

    private final ClubEventRepository clubEventRepository;
    private final ClubEventMapper clubEventMapper;
    private final UserRepository userRepository;

    @PreAuthorize("hasRole('COACH') or hasRole('ADMIN')")
    @Transactional
    public UUID create(UUID coachId, CreateCoachTrainingEventRequest request) {
        validateRequest(coachId, request);

        UserEntity coach = resolveCoach(coachId);

        ClubEventEntity entity = clubEventMapper.create(request);
        entity.setType(ClubEventTypeCodes.COACH_TRAINING);
        entity.setCreatedBy(coach);
        entity.setTrainer(resolveAssignedTrainer(request.getTrainerId()));

        clubEventRepository.save(entity);
        return entity.getId();
    }

    @PreAuthorize("hasRole('COACH') or hasRole('ADMIN')")
    @Transactional
    public void update(UUID coachId, UUID eventId, CreateCoachTrainingEventRequest request) {
        validateRequest(coachId, request);

        ClubEventEntity entity = resolveOwnedCoachEvent(coachId, eventId);

        clubEventMapper.update(request, entity);
        entity.setTrainer(resolveAssignedTrainer(request.getTrainerId()));
        clubEventRepository.save(entity);
    }

    @PreAuthorize("hasRole('COACH') or hasRole('ADMIN')")
    @Transactional
    public void delete(UUID coachId, UUID eventId) {
        ClubEventEntity entity = resolveOwnedCoachEvent(coachId, eventId);
        clubEventRepository.delete(entity);
    }

    private void validateRequest(UUID coachId, CreateCoachTrainingEventRequest request) {
        if (coachId == null || request == null || request.getStartsAt() == null || request.getEndsAt() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        if (!request.getEndsAt().isAfter(request.getStartsAt())) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
    }

    private UserEntity resolveCoach(UUID coachId) {
        return userRepository.findById(coachId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private ClubEventEntity resolveOwnedCoachEvent(UUID coachId, UUID eventId) {
        ClubEventEntity entity = clubEventRepository.findById(eventId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CLUB_EVENT_NOT_FOUND));

        if (!ClubEventTypeCodes.COACH_TRAINING.equals(entity.getType())) {
            throw new BusinessException(ErrorCode.CLUB_EVENT_FORBIDDEN);
        }

        if (entity.getCreatedBy() == null || !coachId.equals(entity.getCreatedBy().getId())) {
            throw new BusinessException(ErrorCode.CLUB_EVENT_FORBIDDEN);
        }

        return entity;
    }

    private UserEntity resolveAssignedTrainer(UUID trainerId) {
        if (trainerId == null) {
            return null;
        }

        UserEntity trainer = userRepository.findByIdWithRole(trainerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        String roleCode = trainer.getRole() == null ? null : trainer.getRole().getCode();
        if (!UserRoleCodes.COACH.equals(roleCode)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        return trainer;
    }
}
