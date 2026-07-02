package com.round13.backend.module.adminpanel.errorjournal.capture;

import com.round13.backend.domain.CriticalErrorEventEntity;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CriticalErrorCaptureService {

    public static final String CAPTURED_REQUEST_ATTRIBUTE = "criticalErrorJournal.captured";

    private static final Logger log = LoggerFactory.getLogger(CriticalErrorCaptureService.class);

    private final CriticalErrorEventFactory eventFactory;
    private final CriticalErrorEventPersistenceService persistenceService;

    public void captureBackendUnhandled(
            Throwable throwable,
            HttpServletRequest request,
            HttpStatus httpStatus,
            String errorCode
    ) {
        try {
            CriticalErrorEventEntity event = eventFactory.backendUnhandled(throwable, request, httpStatus, errorCode);
            persistenceService.save(event);
            request.setAttribute(CAPTURED_REQUEST_ATTRIBUTE, Boolean.TRUE);
        } catch (RuntimeException ex) {
            log.warn("Failed to persist critical error journal event", ex);
        }
    }

    public void captureBackendStatus(HttpServletRequest request, int httpStatus) {
        try {
            CriticalErrorEventEntity event = eventFactory.backendStatus(request, httpStatus);
            persistenceService.save(event);
            request.setAttribute(CAPTURED_REQUEST_ATTRIBUTE, Boolean.TRUE);
        } catch (RuntimeException ex) {
            log.warn("Failed to persist critical error journal status event", ex);
        }
    }
}
