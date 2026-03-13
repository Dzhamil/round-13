package com.round13.backend.module.training.service;

import com.round13.backend.domain.TrainingParticipantEntity;
import com.round13.backend.domain.TrainingSessionEntity;
import com.round13.backend.domain.TrainingType;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.info.repo.TrainingSessionRepository;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.training.dto.CreatePersonalTrainingRequest;
import com.round13.backend.module.training.dto.TrainerScheduleItemResponse;
import com.round13.backend.module.training.mapper.TrainerScheduleMapper;
import com.round13.backend.module.training.repo.TrainingParticipantRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainerScheduleService {

    private final TrainingSessionRepository sessionRepository;
    private final TrainingParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final UserTrainerLinkRepository linkRepository;
    private final TrainingParticipationService trainingParticipationService;
    private final TrainerScheduleMapper mapper;

    @PreAuthorize("hasRole('COACH') or hasRole('ADMIN')")
    @Transactional
    public UUID createPersonalTraining(UUID coachId, CreatePersonalTrainingRequest request) {

        if (coachId == null || request == null || request.getStudentId() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        if (!request.getStartTime().isAfter(OffsetDateTime.now())) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        OffsetDateTime endTime = request.getStartTime().plusMinutes(request.getDurationMinutes());
        if (sessionRepository.existsCoachTimeConflict(coachId, request.getStartTime(), endTime)
                || participantRepository.existsStudentTimeConflict(request.getStudentId(), request.getStartTime(), endTime)) {
            throw new BusinessException(ErrorCode.TRAINING_TIME_SLOT_BUSY);
        }

        boolean linked = linkRepository.existsByTrainerIdAndStudentId(coachId, request.getStudentId());
        if (!linked) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        UserEntity coach = userRepository.findById(coachId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        UserEntity student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        TrainingSessionEntity session = new TrainingSessionEntity();
        session.setTitle("Персональная тренировка");
        session.setType(TrainingType.PERSONAL);
        session.setStartTime(request.getStartTime());
        session.setDurationMinutes(request.getDurationMinutes());
        session.setCapacity(1);
        session.setCoach(coach);

        sessionRepository.save(session);
        trainingParticipationService.createBookedParticipation(session, student);

        return session.getId();
    }

    @PreAuthorize("hasRole('COACH') or hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<TrainerScheduleItemResponse> getTrainerSchedule(UUID coachId, OffsetDateTime from, OffsetDateTime to) {

        List<TrainingSessionEntity> sessions = sessionRepository.findCoachSchedule(coachId, from, to).stream()
                .filter(session -> session.getType() == TrainingType.PERSONAL)
                .toList();

        if (sessions.isEmpty()) {
            return Collections.emptyList();
        }

        List<UUID> ids = sessions.stream()
                .map(TrainingSessionEntity::getId)
                .collect(Collectors.toList());

        List<TrainingParticipantEntity> participants = participantRepository.findBySession_IdIn(ids);

        Map<UUID, TrainingParticipantEntity> bySession = new HashMap<>();
        for (TrainingParticipantEntity participant : participants) {
            bySession.putIfAbsent(participant.getSession().getId(), participant);
        }

        List<TrainerScheduleItemResponse> result = new ArrayList<>();
        for (TrainingSessionEntity session : sessions) {
            result.add(mapper.map(session, bySession.get(session.getId())));
        }

        return result;
    }

    @PreAuthorize("hasRole('COACH') or hasRole('ADMIN')")
    @Transactional
    public void confirmCancellation(UUID coachId, UUID sessionId) {
        trainingParticipationService.confirmCancellation(coachId, sessionId);
    }

    @PreAuthorize("hasRole('COACH') or hasRole('ADMIN')")
    @Transactional
    public void markAttended(UUID coachId, UUID sessionId) {
        trainingParticipationService.markAttended(coachId, sessionId);
    }
}
