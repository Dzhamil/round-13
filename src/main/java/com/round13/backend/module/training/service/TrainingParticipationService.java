package com.round13.backend.module.training.service;

import com.round13.backend.domain.TrainingBalanceEventType;
import com.round13.backend.domain.TrainingParticipantEntity;
import com.round13.backend.domain.TrainingParticipantStatus;
import com.round13.backend.domain.TrainingSessionEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatsEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.members.repo.UserStatsCacheRepository;
import com.round13.backend.module.members.service.MemberPointsCacheService;
import com.round13.backend.module.members.service.TrainingBalanceService;
import com.round13.backend.module.members.service.UserStatsFactory;
import com.round13.backend.module.training.repo.TrainingParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TrainingParticipationService {

    private final TrainingParticipantRepository participantRepository;
    private final TrainingBalanceService trainingBalanceService;
    private final UserStatsCacheRepository userStatsCacheRepository;
    private final UserStatsFactory userStatsFactory;
    private final MemberPointsCacheService memberPointsCacheService;

    public TrainingParticipantEntity createBookedParticipation(TrainingSessionEntity session, UserEntity student) {
        if (session == null || student == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        TrainingParticipantEntity participant = new TrainingParticipantEntity();
        participant.setSession(session);
        participant.setUser(student);
        participant.setStatus(TrainingParticipantStatus.BOOKED);

        return participantRepository.save(participant);
    }

    public void requestCancellation(UUID userId, UUID sessionId) {
        TrainingParticipantEntity participant = getParticipationForUserSession(userId, sessionId);
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime startTime = requireSessionStart(participant);

        if (!startTime.isAfter(now)) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_STARTED);
        }

        ensureStatus(participant, TrainingParticipantStatus.BOOKED);

        participant.setStatus(TrainingParticipantStatus.CANCEL_REQUESTED);
        participant.setCancelRequestedAt(now);
        participantRepository.save(participant);
    }

    public void confirmCancellation(UUID coachId, UUID sessionId) {
        TrainingParticipantEntity participant = getParticipationForCoachSession(coachId, sessionId);
        ensureStatus(participant, TrainingParticipantStatus.CANCEL_REQUESTED);

        OffsetDateTime requestTime = participant.getCancelRequestedAt();
        if (requestTime == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        OffsetDateTime confirmedAt = OffsetDateTime.now();
        OffsetDateTime startTime = requireSessionStart(participant);
        TrainingParticipantStatus nextStatus = requestTime.isAfter(startTime.minusHours(24))
                ? TrainingParticipantStatus.CANCELLED_LATE
                : TrainingParticipantStatus.CANCELLED_FREE;

        participant.setStatus(nextStatus);
        participant.setCancelConfirmedAt(confirmedAt);
        participant.setCancelConfirmedByUserId(coachId);

        if (nextStatus == TrainingParticipantStatus.CANCELLED_LATE) {
            boolean debited = trainingBalanceService.debitOneIfPossible(
                    coachId,
                    participant.getUser().getId(),
                    TrainingBalanceEventType.LATE_CANCEL_DEBIT,
                    coachId
            );
            if (debited) {
                participant.setChargedAt(confirmedAt);
            }
        }

        participantRepository.save(participant);
    }

    public void markAttended(UUID coachId, UUID sessionId) {
        TrainingParticipantEntity participant = getParticipationForCoachSession(coachId, sessionId);
        ensureStatus(participant, TrainingParticipantStatus.BOOKED);

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime startTime = requireSessionStart(participant);
        if (startTime.isAfter(now)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        participant.setStatus(TrainingParticipantStatus.ATTENDED);
        participant.setAttendedAt(now);
        participantRepository.saveAndFlush(participant);

        syncAttendanceStats(participant.getUser());

        boolean debited = trainingBalanceService.debitOneIfPossible(
                coachId,
                participant.getUser().getId(),
                TrainingBalanceEventType.ATTENDED_DEBIT,
                coachId
        );
        if (debited) {
            participant.setChargedAt(now);
        }

        participantRepository.save(participant);
    }

    public UserStatsEntity syncAttendanceStats(UserEntity user) {
        if (user == null || user.getId() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        int attendedCount = (int) participantRepository.countByUser_IdAndStatus(
                user.getId(),
                TrainingParticipantStatus.ATTENDED
        );

        UserStatsEntity stats = userStatsCacheRepository.findById(user.getId())
                .orElseGet(() -> userStatsFactory.createEmpty(user));
        stats.setUser(user);

        if (stats.getTrainingsAttendedCount() != attendedCount || stats.getCreatedAt() == null) {
            stats.setTrainingsAttendedCount(attendedCount);
            stats = userStatsCacheRepository.save(stats);
        }

        memberPointsCacheService.recalcForUser(user.getId());
        return stats;
    }

    @Transactional(readOnly = true)
    public long countAttendedTrainings(UUID userId) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        return participantRepository.countByUser_IdAndStatus(userId, TrainingParticipantStatus.ATTENDED);
    }

    private TrainingParticipantEntity getParticipationForUserSession(UUID userId, UUID sessionId) {
        if (userId == null || sessionId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        return participantRepository.findBySession_IdAndUser_Id(sessionId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PARTICIPATION_NOT_FOUND));
    }

    private TrainingParticipantEntity getParticipationForCoachSession(UUID coachId, UUID sessionId) {
        if (coachId == null || sessionId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        return participantRepository.findBySession_IdAndSession_Coach_Id(sessionId, coachId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PARTICIPATION_NOT_FOUND));
    }

    private OffsetDateTime requireSessionStart(TrainingParticipantEntity participant) {
        if (participant.getSession() == null || participant.getSession().getStartTime() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        return participant.getSession().getStartTime();
    }

    private void ensureStatus(TrainingParticipantEntity participant, TrainingParticipantStatus expectedStatus) {
        if (participant.getStatus() != expectedStatus) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
    }
}
