package com.round13.backend.module.adminpanel.errorjournal.dto;

import com.round13.backend.domain.CriticalErrorSeverity;
import com.round13.backend.domain.CriticalErrorSource;
import com.round13.backend.domain.CriticalErrorStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ErrorJournalDetailResponse(
        UUID id,
        OffsetDateTime occurredAt,
        OffsetDateTime createdAt,
        CriticalErrorSeverity severity,
        CriticalErrorSource source,
        CriticalErrorStatus status,
        String errorCode,
        Integer httpStatus,
        String exceptionClass,
        String errorType,
        String message,
        String stackTrace,
        String requestMethod,
        String requestPath,
        String queryString,
        String requestId,
        String fingerprint,
        UUID actorUserId,
        UUID panelAdminId,
        String remoteAddr,
        String userAgent,
        String resolutionNote,
        OffsetDateTime resolvedAt,
        UUID resolvedByUserId
) {
}
