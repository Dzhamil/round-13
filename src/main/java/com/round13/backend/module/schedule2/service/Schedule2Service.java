package com.round13.backend.module.schedule2.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.info.repo.TrainingSessionRepository;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.schedule2.dto.Schedule2Dtos.*;
import com.round13.backend.module.sheets.service.AttendanceSheetSyncService;
import com.round13.backend.module.training.repo.TrainingParticipantRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class Schedule2Service {
    private final TrainingSessionRepository sessionRepository;
    private final TrainingParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final AttendanceSheetSyncService sheetSyncService;

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

    @Transactional
    public TrainingDetail create(UUID trainerId, CreateTrainingRequest request) {
        UserEntity trainer = userRepository.findByIdWithRole(trainerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Тренер не найден"));
        TrainingSessionEntity session = new TrainingSessionEntity();
        session.setTitle(request.title().trim());
        session.setType(request.type());
        session.setStartTime(request.startTime());
        session.setDurationMinutes(request.durationMinutes());
        session.setLocation(trim(request.location()));
        session.setTimezone(trim(request.timezone()) == null ? "Europe/Moscow" : request.timezone().trim());
        session.setCoach(trainer);
        session.setSchedule2Enabled(true);
        var studentIds = new LinkedHashSet<>(request.studentIds());
        Map<UUID, UserEntity> students = new HashMap<>();
        if (!studentIds.isEmpty()) userRepository.findAllById(studentIds).forEach(u -> students.put(u.getId(), u));
        if (!students.keySet().containsAll(studentIds)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ученик не найден");
        }
        session = sessionRepository.save(session);
        List<TrainingParticipantEntity> participants = new ArrayList<>();
        for (UUID studentId : studentIds) {
            UserEntity student = students.get(studentId);
            TrainingParticipantEntity participant = new TrainingParticipantEntity();
            participant.setSession(session);
            participant.setUser(student);
            participant.setStatus(TrainingParticipantStatus.BOOKED);
            participant.setAttendanceStatus(AttendanceStatus.ABSENT);
            participants.add(participant);
        }
        if (!participants.isEmpty()) participantRepository.saveAll(participants);
        return detail(trainerId, session.getId());
    }

    @Transactional
    public TrainingDetail applyAttendance(UUID trainerId, UUID trainingId, AttendanceRequest request) {
        TrainingSessionEntity training = owned(trainingId, trainerId);
        Map<UUID, TrainingParticipantEntity> expected = new HashMap<>();
        participantRepository.findSchedule2Participants(trainingId).forEach(p -> expected.put(p.getId(), p));
        if (request.participants().size() != expected.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Передайте посещаемость всех участников");
        }
        OffsetDateTime now = OffsetDateTime.now();
        for (AttendanceItem item : request.participants()) {
            TrainingParticipantEntity entity = expected.remove(item.participationId());
            if (entity == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Участник не относится к тренировке");
            if (entity.getAttendanceVersion() != item.version()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Посещаемость была изменена; обновите страницу");
            }
            entity.setAttendanceStatus(item.status());
            entity.setAttendanceComment(trim(item.comment()));
            entity.setAttendanceMarkedAt(now);
            entity.setAttendanceUpdatedAt(now);
            entity.setAttendanceMarkedByUserId(trainerId);
            entity.setAttendanceVersion(entity.getAttendanceVersion() + 1);
            participantRepository.save(entity);
        }
        participantRepository.flush();
        sheetSyncService.sync(training, participantRepository.findSchedule2Participants(trainingId), trainerId);
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
                s.getLocation(), s.getCoach().getId(), name(s.getCoach(), profiles), count, s.getVersion());
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
    private String trim(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
