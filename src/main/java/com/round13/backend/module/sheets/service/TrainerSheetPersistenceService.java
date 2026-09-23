package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.info.repo.TrainingSessionRepository;
import com.round13.backend.module.training.repo.TrainingParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;

/** Reconciles only source-owned rows; must run inside the per-sheet locked transaction. */
@Service
@RequiredArgsConstructor
public class TrainerSheetPersistenceService {
    public record Counts(int sessions, int participants, int retiredSessions, int removedParticipants) {}
    private final TrainingSessionRepository sessions;
    private final TrainingParticipantRepository participants;

    @Transactional(propagation = Propagation.MANDATORY)
    public Counts apply(String spreadsheetId, UserEntity coach, TrainerSheetImportPlan plan) {
        var existing = sessions.findBySheetImportSpreadsheetIdAndCoach_Id(spreadsheetId, coach.getId());
        Map<TrainerSheetImportPlan.Key, TrainingSessionEntity> byKey = new HashMap<>();
        existing.forEach(s -> byKey.put(new TrainerSheetImportPlan.Key(s.getSheetImportTrainingId(), s.getSheetImportDate()), s));
        List<TrainingSessionEntity> retained = new ArrayList<>();
        for (var item : plan.sessions()) {
            var session = byKey.remove(item.key());
            if (session == null) {
                session = new TrainingSessionEntity();
                session.setCoach(coach);
                session.setSheetImportSpreadsheetId(spreadsheetId);
                session.setSheetImportTrainingId(item.key().trainingId());
                session.setSheetImportDate(item.key().date());
            } else if (!session.getTitle().equals(item.title()) || session.getType() != item.type()
                    || session.getDurationMinutes() != item.duration() || !session.isSheetImportActive()) {
                session.setVersion(session.getVersion() + 1);
            }
            session.setTitle(item.title());
            session.setType(item.type());
            session.setDurationMinutes(item.duration());
            session.setStartTime(item.key().date().atZone(ZoneId.of("Europe/Moscow")).toOffsetDateTime());
            session.setTimezone("Europe/Moscow");
            session.setSchedule2Enabled(true);
            session.setSheetImportActive(true);
            retained.add(session);
        }
        int retired = 0;
        for (var stale : byKey.values()) {
            if (stale.isSheetImportActive()) { stale.setSheetImportActive(false); stale.setVersion(stale.getVersion() + 1); retired++; }
        }
        List<TrainingSessionEntity> changed = new ArrayList<>(retained);
        changed.addAll(byKey.values());
        if (!changed.isEmpty()) sessions.saveAll(changed);
        List<UUID> ids = changed.stream().map(TrainingSessionEntity::getId).toList();
        List<TrainingParticipantEntity> current = new ArrayList<>();
        for (int start = 0; start < ids.size(); start += 500) {
            current.addAll(participants.findBySession_IdIn(ids.subList(start, Math.min(start + 500, ids.size()))));
        }
        Map<MemberKey, TrainingParticipantEntity> byMember = new HashMap<>();
        current.forEach(p -> byMember.put(new MemberKey(p.getSession().getId(), p.getUser().getId()), p));
        List<TrainingParticipantEntity> upsert = new ArrayList<>();
        var now = OffsetDateTime.now();
        for (int index = 0; index < retained.size(); index++) {
            var session = retained.get(index);
            for (var member : plan.sessions().get(index).members()) {
                var participant = byMember.remove(new MemberKey(session.getId(), member.user().getId()));
                if (participant == null) {
                    participant = new TrainingParticipantEntity();
                    participant.setSession(session);
                    participant.setUser(member.user());
                    participant.setSheetImportCreated(true);
                }
                if (session.getAttendanceSheetSyncStatus() == AttendanceSheetSyncStatus.NEW
                        && participant.getAttendanceStatus() != member.attendance()) {
                    participant.setAttendanceStatus(member.attendance());
                    participant.setAttendanceVersion(participant.getAttendanceVersion() + 1);
                    participant.setAttendanceUpdatedAt(now);
                }
                participant.setSheetImportPaid(member.paid());
                upsert.add(participant);
            }
        }
        // Preserve app-created rows and all confirmed facts, even if a source row/session disappears.
        var removed = byMember.values().stream().filter(TrainingParticipantEntity::isSheetImportCreated)
                .filter(p -> p.getSession().getAttendanceSheetSyncStatus() == AttendanceSheetSyncStatus.NEW).toList();
        if (!removed.isEmpty()) participants.deleteAllInBatch(removed);
        if (!upsert.isEmpty()) participants.saveAll(upsert);
        participants.flush();
        return new Counts(retained.size(), upsert.size(), retired, removed.size());
    }

    private record MemberKey(UUID sessionId, UUID userId) {}
}
