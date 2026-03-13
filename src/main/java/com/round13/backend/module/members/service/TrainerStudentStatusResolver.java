package com.round13.backend.module.members.service;

import com.round13.backend.domain.TrainingParticipantEntity;
import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.module.members.dto.StudentOperationalStatusCode;
import com.round13.backend.module.members.dto.StudentOperationalStatusResponse;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
public class TrainerStudentStatusResolver {

    private static final int LONG_ABSENCE_DAYS = 30;
    private static final int RISK_ABSENCE_DAYS = 14;
    private static final int LOW_BALANCE_THRESHOLD = 1;

    public StudentOperationalStatusResponse resolve(
            UserTrainerLinkEntity link,
            OffsetDateTime lastAttendedAt,
            TrainingParticipantEntity nextTraining,
            OffsetDateTime now
    ) {
        StudentOperationalStatusCode code = resolveCode(link, lastAttendedAt, nextTraining, now);
        return new StudentOperationalStatusResponse(code, lastAttendedAt);
    }

    private StudentOperationalStatusCode resolveCode(
            UserTrainerLinkEntity link,
            OffsetDateTime lastAttendedAt,
            TrainingParticipantEntity nextTraining,
            OffsetDateTime now
    ) {
        if (lastAttendedAt != null && lastAttendedAt.isBefore(now.minusDays(LONG_ABSENCE_DAYS))) {
            return StudentOperationalStatusCode.LONG_ABSENT;
        }

        if (lastAttendedAt == null && nextTraining == null && link.getCreatedAt().isBefore(now.minusDays(LONG_ABSENCE_DAYS))) {
            return StudentOperationalStatusCode.LONG_ABSENT;
        }

        if (link.getRemainingTrainings() <= LOW_BALANCE_THRESHOLD) {
            return StudentOperationalStatusCode.RISK;
        }

        if (lastAttendedAt == null) {
            return nextTraining == null ? StudentOperationalStatusCode.RISK : StudentOperationalStatusCode.ACTIVE;
        }

        if (lastAttendedAt.isBefore(now.minusDays(RISK_ABSENCE_DAYS))) {
            return StudentOperationalStatusCode.RISK;
        }

        return StudentOperationalStatusCode.ACTIVE;
    }
}
