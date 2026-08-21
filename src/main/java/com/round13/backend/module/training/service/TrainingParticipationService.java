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
import com.round13.backend.module.loyalty.service.LoyaltyAccrualService;
import com.round13.backend.module.shop.service.GroupTrainingEntitlementService;
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
    private final GroupTrainingEntitlementService groupTrainingEntitlementService;
    private final UserStatsCacheRepository userStatsCacheRepository;
    private final UserStatsFactory userStatsFactory;
    private final MemberPointsCacheService memberPointsCacheService;
    private final LoyaltyAccrualService loyaltyAccrualService;

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
        TrainingParticipantStatus nextStatus = TrainingParticipantStatus.cancellationResult(
                requestTime.isAfter(startTime.minusHours(24))
        );

        participant.setStatus(nextStatus);
        participant.setCancelConfirmedAt(confirmedAt);
        participant.setCancelConfirmedByUserId(coachId);

        if (nextStatus.chargesTrainingBalance()) {
            boolean debited = chargeParticipation(participant, coachId, TrainingBalanceEventType.LATE_CANCEL_DEBIT);
            if (debited) {
                participant.setChargedAt(confirmedAt);
            }
        }

        participantRepository.saveAndFlush(participant);
        syncParticipationStats(participant.getUser());
    }

    public void cancelByTrainer(UUID coachId, UUID sessionId) {
        TrainingParticipantEntity participant = getParticipationForCoachSession(coachId, sessionId);
        OffsetDateTime startTime = requireSessionStart(participant);

        if (!startTime.isAfter(OffsetDateTime.now())) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        TrainingParticipantStatus status = participant.getStatus();
        if (status == null || !status.canBeCancelledByTrainer()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        participant.setStatus(TrainingParticipantStatus.CANCELLED_BY_TRAINER);
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

        syncParticipationStats(participant.getUser());
        loyaltyAccrualService.accrueTrainingVisit(participant.getUser().getId(), coachId, participant.getId(), now);

        boolean debited = chargeParticipation(participant, coachId, TrainingBalanceEventType.ATTENDED_DEBIT);
        if (debited) {
            participant.setChargedAt(now);
        }

        participantRepository.save(participant);
    }

    public void markNoShow(UUID coachId, UUID sessionId) {
        TrainingParticipantEntity participant = getParticipationForCoachSession(coachId, sessionId);
        ensureStatus(participant, TrainingParticipantStatus.BOOKED);

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime startTime = requireSessionStart(participant);
        if (startTime.isAfter(now)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        participant.setStatus(TrainingParticipantStatus.NO_SHOW);
        participantRepository.saveAndFlush(participant);

        syncParticipationStats(participant.getUser());

        boolean debited = chargeParticipation(participant, coachId, TrainingBalanceEventType.NO_SHOW_DEBIT);
        if (debited) {
            participant.setChargedAt(now);
        }

        participantRepository.save(participant);
    }

    public UserStatsEntity syncParticipationStats(UserEntity user) {
        if (user == null || user.getId() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        int attendedCount = (int) participantRepository.countByUser_IdAndStatus(
                user.getId(),
                TrainingParticipantStatus.ATTENDED
        );
        int missedCount = (int) participantRepository.countMissedForStats(user.getId());

        UserStatsEntity stats = userStatsCacheRepository.findById(user.getId())
                .orElseGet(() -> userStatsFactory.createEmpty(user));
        stats.setUser(user);

        if (stats.getTrainingsAttendedCount() != attendedCount
                || stats.getTrainingsMissedCount() != missedCount
                || stats.getCreatedAt() == null) {
            stats.setTrainingsAttendedCount(attendedCount);
            stats.setTrainingsMissedCount(missedCount);
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

    private boolean chargeParticipation(
            TrainingParticipantEntity participant,
            UUID actorUserId,
            TrainingBalanceEventType eventType
    ) {
        TrainingSessionEntity session = participant.getSession();
        if (session == null || session.getType() == null) {
            return false;
        }

        if (session.getType().isPersonal()) {
            if (session.getCoach() == null || session.getCoach().getId() == null) {
                return false;
            }
            return trainingBalanceService.debitOneIfPossible(
                    session.getCoach().getId(),
                    participant.getUser().getId(),
                    eventType,
                    actorUserId
            );
        }

        if (session.getType().usesGroupEntitlement()) {
            return groupTrainingEntitlementService.debitOneIfPossible(participant.getUser().getId());
        }

        return false;
    }
}
