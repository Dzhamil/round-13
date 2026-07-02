package com.round13.backend.module.adminpanel.errorjournal.capture;

import com.round13.backend.domain.CriticalErrorEventEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CriticalErrorCaptureServiceTest {

    private final CriticalErrorEventFactory eventFactory = mock(CriticalErrorEventFactory.class);
    private final CriticalErrorEventPersistenceService persistenceService = mock(CriticalErrorEventPersistenceService.class);
    private final CriticalErrorCaptureService service = new CriticalErrorCaptureService(eventFactory, persistenceService);

    @Test
    void persistsUnhandledExceptionAndMarksRequestCaptured() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        CriticalErrorEventEntity event = new CriticalErrorEventEntity();
        IllegalStateException exception = new IllegalStateException("boom");
        when(eventFactory.backendUnhandled(exception, request, HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR"))
                .thenReturn(event);

        service.captureBackendUnhandled(exception, request, HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR");

        verify(persistenceService).save(event);
        verify(request).setAttribute(CriticalErrorCaptureService.CAPTURED_REQUEST_ATTRIBUTE, Boolean.TRUE);
    }

    @Test
    void persistenceFailureDoesNotEscape() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(eventFactory.backendStatus(request, 500)).thenReturn(new CriticalErrorEventEntity());
        when(persistenceService.save(any(CriticalErrorEventEntity.class))).thenThrow(new IllegalStateException("db down"));

        service.captureBackendStatus(request, 500);
    }
}
