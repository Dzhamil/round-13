package com.round13.backend.module.schedule2.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.schedule2.dto.Schedule2Dtos.*;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import com.round13.backend.module.training.repo.TrainingParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.OffsetDateTime;
import java.util.*;

/** Owns the atomic attendance confirmation. This transaction commits before any external delivery. */
@Service
@RequiredArgsConstructor
public class Schedule2AttendanceCommand {
    private final TrainingParticipantRepository participantRepository;
    private final GoogleSheetSpaceRepository spaceRepository;
    private final Schedule2TrainingAccess access;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void save(UUID trainerId, UUID trainingId, AttendanceRequest request) {
        spaceRepository.findActiveForUpdate();
        TrainingSessionEntity training = access.ownedForUpdate(trainingId, trainerId);
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
        training.setAttendanceSheetSyncStatus(AttendanceSheetSyncStatus.NOT_SYNCED);
        training.setAttendanceSheetSyncAttemptedAt(null);
        training.setAttendanceSheetSyncedAt(null);
        participantRepository.flush();
    }

    private String trim(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
