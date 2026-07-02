package com.round13.backend.module.adminpanel.errorjournal.dto;

import com.round13.backend.domain.CriticalErrorSeverity;
import com.round13.backend.domain.CriticalErrorSource;
import com.round13.backend.domain.CriticalErrorStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ErrorJournalListItemResponse(
        UUID id,
        OffsetDateTime occurredAt,
        CriticalErrorSeverity severity,
        CriticalErrorSource source,
        CriticalErrorStatus status,
        String errorCode,
        Integer httpStatus,
        String exceptionClass,
        String message,
        String requestMethod,
        String requestPath,
        UUID actorUserId,
        UUID panelAdminId,
        String requestId,
        String fingerprint
) {
}
