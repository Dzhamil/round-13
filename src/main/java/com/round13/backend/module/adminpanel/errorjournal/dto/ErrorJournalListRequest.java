package com.round13.backend.module.adminpanel.errorjournal.dto;

import com.round13.backend.domain.CriticalErrorSeverity;
import com.round13.backend.domain.CriticalErrorSource;
import com.round13.backend.domain.CriticalErrorStatus;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.OffsetDateTime;

public record ErrorJournalListRequest(
        Integer page,
        Integer size,
        CriticalErrorStatus status,
        CriticalErrorSeverity severity,
        CriticalErrorSource source,
        Integer httpStatus,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to,
        String path,
        String errorCode,
        String q
) {
}
