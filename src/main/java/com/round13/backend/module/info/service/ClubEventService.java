package com.round13.backend.module.info.service;

import com.round13.backend.domain.ClubEventEntity;
import com.round13.backend.domain.ClubEventParticipantEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.info.ClubEventTypeCodes;
import com.round13.backend.module.info.dto.ClubEventResponse;
import com.round13.backend.module.info.mapper.ClubEventMapper;
import com.round13.backend.module.info.repo.ClubEventParticipantRepository;
import com.round13.backend.module.info.repo.ClubEventRepository;
import com.round13.backend.module.shop.service.GroupTrainingEntitlementService;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClubEventService {

    private final ClubEventRepository clubEventRepository;
    private final ClubEventParticipantRepository clubEventParticipantRepository;
    private final ClubEventMapper clubEventMapper;
    private final UserRepository userRepository;
    private final GroupTrainingEntitlementService groupTrainingEntitlementService;

    @Transactional(readOnly = true)
    public List<ClubEventResponse> getUpcoming(UUID userId) {
        List<ClubEventEntity> events = clubEventRepository.findUpcoming(OffsetDateTime.now());
        if (events.isEmpty()) {
            return List.of();
        }

        Set<UUID> joinedIds = loadJoinedEventIds(userId, events);

        return events.stream()
                .map(clubEventMapper::toResponse)
                .peek(item -> item.setJoinedByMe(joinedIds.contains(item.getId())))
                .peek(item -> enrichGroupTrainingInfo(item, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClubEventResponse> getHistory(UUID userId) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime todayStart = now.toLocalDate().atStartOfDay().atOffset(now.getOffset());

        List<ClubEventEntity> events = clubEventRepository.findHistory(now, todayStart);
        if (events.isEmpty()) {
            return List.of();
        }

        Set<UUID> joinedIds = loadJoinedEventIds(userId, events);

        return events.stream()
                .map(clubEventMapper::toResponse)
                .peek(item -> item.setJoinedByMe(joinedIds.contains(item.getId())))
                .peek(item -> enrichGroupTrainingInfo(item, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClubEventResponse> getMyEvents(UUID userId) {
        List<ClubEventParticipantEntity> participations = clubEventParticipantRepository.findMyEvents(userId, OffsetDateTime.now());
        return participations.stream()
                .map(ClubEventParticipantEntity::getEvent)
                .map(clubEventMapper::toResponse)
                .peek(item -> item.setJoinedByMe(true))
                .peek(item -> enrichGroupTrainingInfo(item, userId))
                .toList();
    }

    @Transactional
    public void join(UUID userId, UUID eventId) {
        if (clubEventParticipantRepository.existsByEvent_IdAndUser_Id(eventId, userId)) {
            throw new BusinessException(ErrorCode.CLUB_EVENT_ALREADY_JOINED);
        }

        ClubEventEntity event = clubEventRepository.findById(eventId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CLUB_EVENT_NOT_FOUND));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ClubEventParticipantEntity entity = new ClubEventParticipantEntity();
        entity.setEvent(event);
        entity.setUser(user);

        if (requiresGroupPackage(event)) {
            UUID chargedEntitlementId = groupTrainingEntitlementService.reserveOneIfPossible(
                            userId,
                            event.getId(),
                            event.getTitle()
                    )
                    .orElseThrow(() -> new BusinessException(ErrorCode.GROUP_TRAINING_PACKAGE_REQUIRED));
            entity.setChargedEntitlementId(chargedEntitlementId);
            entity.setChargedAt(OffsetDateTime.now());
        }

        clubEventParticipantRepository.save(entity);
    }

    @Transactional
    public void cancel(UUID userId, UUID eventId) {
        ClubEventParticipantEntity participation = clubEventParticipantRepository.findByEvent_IdAndUser_Id(eventId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CLUB_EVENT_PARTICIPATION_NOT_FOUND));

        if (requiresGroupPackage(participation.getEvent()) && canRefundGroupPackage(participation)) {
            groupTrainingEntitlementService.refundOne(
                    participation.getChargedEntitlementId(),
                    participation.getEvent().getId(),
                    participation.getEvent().getTitle()
            );
        }

        clubEventParticipantRepository.delete(participation);
    }

    private Set<UUID> loadJoinedEventIds(UUID userId, List<ClubEventEntity> events) {
        if (userId == null || events.isEmpty()) {
            return Set.of();
        }

        List<UUID> eventIds = events.stream().map(ClubEventEntity::getId).toList();
        return new HashSet<>(clubEventParticipantRepository.findJoinedEventIds(userId, eventIds));
    }

    private void enrichGroupTrainingInfo(ClubEventResponse response, UUID userId) {
        boolean requiresGroupPackage = ClubEventTypeCodes.COACH_TRAINING.equals(response.getType());
        response.setRequiresGroupPackage(requiresGroupPackage);
        response.setRemainingGroupTrainings(
                requiresGroupPackage && userId != null
                        ? groupTrainingEntitlementService.getRemainingGroupTrainings(userId)
                        : null
        );
    }

    private boolean requiresGroupPackage(ClubEventEntity event) {
        return event != null && ClubEventTypeCodes.COACH_TRAINING.equals(event.getType());
    }

    private boolean canRefundGroupPackage(ClubEventParticipantEntity participation) {
        return participation.getChargedEntitlementId() != null
                && participation.getEvent() != null
                && participation.getEvent().getStartsAt() != null
                && participation.getEvent().getStartsAt().isAfter(OffsetDateTime.now());
    }
}
