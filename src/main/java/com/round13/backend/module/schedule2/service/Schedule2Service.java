package com.round13.backend.module.schedule2.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.info.repo.TrainingSessionRepository;
import com.round13.backend.module.schedule2.dto.Schedule2Dtos.*;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class Schedule2Service {
    private final TrainingSessionRepository sessionRepository;
    private final TrainingParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final Schedule2QueryService queries;
    private final Schedule2AttendanceCommand attendanceCommand;
    private final Schedule2AttendanceDelivery attendanceDelivery;

    public List<TrainingSummary> list(UUID trainerId, LocalDate from, LocalDate to) {
        return queries.list(trainerId, from, to);
    }

    public TrainingDetail detail(UUID trainerId, UUID trainingId) {
        return queries.detail(trainerId, trainingId);
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

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public TrainingDetail applyAttendance(UUID trainerId, UUID trainingId, AttendanceRequest request) {
        attendanceCommand.save(trainerId, trainingId, request);
        return syncAttendance(trainerId, trainingId);
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public TrainingDetail syncAttendance(UUID trainerId, UUID trainingId) {
        // Authorize outside the delivery error boundary; an unauthorized retry remains an API error.
        queries.freshDetail(trainerId, trainingId);
        try {
            attendanceDelivery.deliver(trainerId, trainingId);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            log.error("Attendance delivery transaction failed; committed attendance retained: training={} trainer={}",
                    trainingId, trainerId, ex);
        }
        return queries.freshDetail(trainerId, trainingId);
    }

    private String trim(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
