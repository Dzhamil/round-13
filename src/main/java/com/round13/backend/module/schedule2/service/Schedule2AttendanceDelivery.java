package com.round13.backend.module.schedule2.service;

import com.round13.backend.domain.AttendanceSheetSyncStatus;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import com.round13.backend.module.sheets.service.Schedule2AttendanceSheetWriter;
import com.round13.backend.module.training.repo.TrainingParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Serializes delivery with confirmations/imports and always sends the latest committed DB snapshot. */
@Service
@RequiredArgsConstructor
public class Schedule2AttendanceDelivery {
    private final GoogleSheetSpaceRepository spaces;
    private final Schedule2TrainingAccess access;
    private final TrainingParticipantRepository participants;
    private final Schedule2AttendanceSheetWriter writer;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deliver(UUID trainerId, UUID trainingId) {
        // Keep the import lock order: active space first, then session, then participants.
        spaces.findActiveForUpdate();
        var training = access.ownedForUpdate(trainingId, trainerId);
        if (training.getAttendanceSheetSyncStatus() != AttendanceSheetSyncStatus.NOT_SYNCED
                || training.getSheetImportSpreadsheetId() == null) return;
        training.setAttendanceSheetSyncAttemptedAt(OffsetDateTime.now());
        if (writer.sync(training, participants.findSchedule2Participants(trainingId), trainerId)) {
            training.setAttendanceSheetSyncStatus(AttendanceSheetSyncStatus.SYNCED);
            training.setAttendanceSheetSyncedAt(OffsetDateTime.now());
        }
    }
}
