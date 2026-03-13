package com.round13.backend.module.info.service;

import com.round13.backend.domain.TrainingParticipantEntity;
import com.round13.backend.domain.TrainingSessionEntity;
import com.round13.backend.domain.TrainingType;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.info.dto.TrainingSessionResponse;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.info.mapper.TrainingSessionMapper;
import com.round13.backend.module.info.repo.TrainingSessionRepository;
import com.round13.backend.module.training.repo.TrainingParticipantRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TrainingSessionService {

    private static final OffsetDateTime MIN_FROM = OffsetDateTime.of(1970,1,1,0,0,0,0, ZoneOffset.UTC);
    private static final OffsetDateTime MAX_TO = OffsetDateTime.of(9999,12,31,23,59,59,0, ZoneOffset.UTC);

    private final TrainingSessionRepository sessionRepository;
    private final TrainingParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final TrainingSessionMapper sessionMapper;

    @Transactional(readOnly = true)
    public List<TrainingSessionResponse> getSessions(String type, UUID coachId, OffsetDateTime from, OffsetDateTime to) {
        TrainingType trainingType = parseTypeOrNull(type);
        OffsetDateTime safeFrom = from == null ? MIN_FROM : from;
        OffsetDateTime safeTo = to == null ? MAX_TO : to;
        if (!safeTo.isAfter(safeFrom)) throw new BusinessException(ErrorCode.INVALID_REQUEST);

        List<TrainingSessionEntity> sessions = sessionRepository.search(trainingType, coachId, safeFrom, safeTo);
        if (sessions.isEmpty()) return List.of();

        Map<UUID, Long> counts = loadCountsBySessionId(sessions);

        List<TrainingSessionResponse> result = new ArrayList<>(sessions.size());
        for (TrainingSessionEntity s : sessions) result.add(sessionMapper.toResponse(s, counts.getOrDefault(s.getId(), 0L)));
        return result;
    }

    @Transactional(readOnly = true)
    public TrainingSessionResponse getById(UUID sessionId) {
        TrainingSessionEntity session = sessionRepository.findByIdWithCoach(sessionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));
        long count = participantRepository.countBySession_Id(sessionId);
        return sessionMapper.toResponse(session, count);
    }

    @Transactional
    public void join(UUID userId, UUID sessionId) {
        TrainingSessionEntity session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));
        ensureNotStarted(session);

        if (participantRepository.existsBySession_IdAndUser_Id(sessionId, userId))
            throw new BusinessException(ErrorCode.ALREADY_JOINED);

        if (session.getCapacity() != null) {
            long count = participantRepository.countBySession_Id(sessionId);
            if (count >= session.getCapacity())
                throw new BusinessException(ErrorCode.SESSION_FULL);
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        TrainingParticipantEntity participant = new TrainingParticipantEntity();
        participant.setSession(session);
        participant.setUser(user);
        participantRepository.save(participant);
    }

    @Transactional
    public void cancel(UUID userId, UUID sessionId) {
        TrainingSessionEntity session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));
        ensureNotStarted(session);

        TrainingParticipantEntity participation = participantRepository
                .findBySession_IdAndUser_Id(sessionId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PARTICIPATION_NOT_FOUND));

        participantRepository.delete(participation);
    }

    private void ensureNotStarted(TrainingSessionEntity session) {
        if (OffsetDateTime.now().isAfter(session.getStartTime()))
            throw new BusinessException(ErrorCode.SESSION_ALREADY_STARTED);
    }

    private TrainingType parseTypeOrNull(String type) {
        if (type == null || type.isBlank()) return null;
        try { return TrainingType.valueOf(type.trim().toUpperCase()); }
        catch (IllegalArgumentException e) { throw new BusinessException(ErrorCode.INVALID_REQUEST); }
    }

    private Map<UUID, Long> loadCountsBySessionId(List<TrainingSessionEntity> sessions) {
        List<UUID> ids = sessions.stream().map(TrainingSessionEntity::getId).toList();
        Map<UUID, Long> map = new HashMap<>();
        for (Object[] row : participantRepository.countBySessionIds(ids)) map.put((UUID) row[0], (Long) row[1]);
        return map;
    }
}
