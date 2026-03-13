package com.round13.backend.module.training.service;

import com.round13.backend.domain.ClubEventEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.info.ClubEventTypeCodes;
import com.round13.backend.module.info.mapper.ClubEventMapper;
import com.round13.backend.module.info.repo.ClubEventRepository;
import com.round13.backend.module.training.dto.CreateCoachTrainingEventRequest;
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
        if (coachId == null || request == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        if (!request.getEndsAt().isAfter(request.getStartsAt())) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        UserEntity coach = userRepository.findById(coachId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ClubEventEntity entity = clubEventMapper.create(request);
        entity.setType(ClubEventTypeCodes.COACH_TRAINING);
        entity.setCreatedBy(coach);

        clubEventRepository.save(entity);
        return entity.getId();
    }

    @PreAuthorize("hasRole('COACH') or hasRole('ADMIN')")
    @Transactional
    public void update(UUID coachId, UUID eventId, CreateCoachTrainingEventRequest request) {
        if (coachId == null || request == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        if (!request.getEndsAt().isAfter(request.getStartsAt())) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        ClubEventEntity entity = clubEventRepository.findById(eventId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CLUB_EVENT_NOT_FOUND));

        if (!ClubEventTypeCodes.COACH_TRAINING.equals(entity.getType())) {
            throw new BusinessException(ErrorCode.CLUB_EVENT_FORBIDDEN);
        }

        if (entity.getCreatedBy() == null || !coachId.equals(entity.getCreatedBy().getId())) {
            throw new BusinessException(ErrorCode.CLUB_EVENT_FORBIDDEN);
        }

        clubEventMapper.update(request, entity);
        clubEventRepository.save(entity);
    }

    @PreAuthorize("hasRole('COACH') or hasRole('ADMIN')")
    @Transactional
    public void delete(UUID coachId, UUID eventId) {
        ClubEventEntity entity = clubEventRepository.findById(eventId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CLUB_EVENT_NOT_FOUND));

        if (!ClubEventTypeCodes.COACH_TRAINING.equals(entity.getType())) {
            throw new BusinessException(ErrorCode.CLUB_EVENT_FORBIDDEN);
        }

        if (entity.getCreatedBy() == null || !coachId.equals(entity.getCreatedBy().getId())) {
            throw new BusinessException(ErrorCode.CLUB_EVENT_FORBIDDEN);
        }

        clubEventRepository.delete(entity);
    }
}
