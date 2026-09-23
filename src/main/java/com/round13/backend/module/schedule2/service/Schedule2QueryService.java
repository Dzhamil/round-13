package com.round13.backend.module.schedule2.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.info.repo.TrainingSessionRepository;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.schedule2.dto.Schedule2Dtos.*;
import com.round13.backend.module.training.repo.TrainingParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class Schedule2QueryService {
    private final TrainingSessionRepository sessionRepository;
    private final TrainingParticipantRepository participantRepository;
    private final ProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public List<TrainingSummary> list(UUID trainerId, LocalDate from, LocalDate to) {
        ZoneId zone = ZoneId.of("Europe/Moscow");
        var sessions = sessionRepository.findSchedule2ByCoach(trainerId, from.atStartOfDay(zone).toOffsetDateTime(),
                        to.plusDays(1).atStartOfDay(zone).toOffsetDateTime());
        if (sessions.isEmpty()) return List.of();
        Map<UUID, Long> counts = new HashMap<>();
        participantRepository.countBySessionIds(sessions.stream().map(TrainingSessionEntity::getId).toList())
                .forEach(row -> counts.put((UUID) row[0], ((Number) row[1]).longValue()));
        var profiles = profiles(sessions.stream().map(s -> s.getCoach().getId()).toList());
        return sessions.stream().map(s -> summary(s, counts.getOrDefault(s.getId(), 0L).intValue(), profiles)).toList();
    }

    @Transactional(readOnly = true)
    public TrainingDetail detail(UUID trainerId, UUID trainingId) {
        TrainingSessionEntity training = owned(trainingId, trainerId);
        var participants = participantRepository.findSchedule2Participants(trainingId);
        List<UUID> ids = new ArrayList<>();
        ids.add(training.getCoach().getId());
        participants.forEach(p -> ids.add(p.getUser().getId()));
        var profiles = profiles(ids);
        return new TrainingDetail(summary(training, participants.size(), profiles), participants
                .stream().map(p -> participant(p, profiles)).toList());
    }

    @Transactional(readOnly = true, propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public TrainingDetail freshDetail(UUID trainerId, UUID trainingId) {
        return detail(trainerId, trainingId);
    }

    private TrainingSessionEntity owned(UUID id, UUID trainerId) {
        TrainingSessionEntity training = sessionRepository.findSchedule2ById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Тренировка не найдена"));
        if (training.getCoach() == null || !training.getCoach().getId().equals(trainerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Доступно только расписание текущего тренера");
        }
        return training;
    }
    private TrainingSummary summary(TrainingSessionEntity s, int count, Map<UUID, ProfileEntity> profiles) {
        return new TrainingSummary(s.getId(), s.getTitle(), s.getType(), s.getStartTime(), s.getEndTime(), s.getTimezone(),
                s.getLocation(), s.getCoach().getId(), name(s.getCoach(), profiles), count, s.getVersion(),
                s.getAttendanceSheetSyncStatus(), s.getAttendanceSheetSyncAttemptedAt(), s.getAttendanceSheetSyncedAt());
    }
    private Participant participant(TrainingParticipantEntity p, Map<UUID, ProfileEntity> profiles) {
        return new Participant(p.getId(), p.getUser().getId(), name(p.getUser(), profiles), p.getAttendanceStatus(),
                p.getAttendanceComment(), p.getAttendanceVersion());
    }
    private String name(UserEntity user, Map<UUID, ProfileEntity> profiles) {
        return Optional.ofNullable(profiles.get(user.getId())).map(p -> {
            List<String> parts = Arrays.asList(p.getSurname(), p.getFirstName(), p.getPatronymic()).stream()
                    .filter(Objects::nonNull).filter(v -> !v.isBlank()).toList();
            if (!parts.isEmpty()) return String.join(" ", parts);
            return p.getFullName() == null ? user.getPhone() : p.getFullName();
        }).orElse(user.getPhone());
    }
    private Map<UUID, ProfileEntity> profiles(List<UUID> ids) {
        Map<UUID, ProfileEntity> profiles = new HashMap<>();
        if (!ids.isEmpty()) profileRepository.findByUserIdIn(ids.stream().distinct().toList())
                .forEach(p -> profiles.put(p.getUser().getId(), p));
        return profiles;
    }
}
