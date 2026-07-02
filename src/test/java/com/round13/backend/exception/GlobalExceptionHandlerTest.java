package com.round13.backend.exception;

import com.round13.backend.module.adminpanel.errorjournal.capture.CriticalErrorCaptureService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class GlobalExceptionHandlerTest {

    private final CriticalErrorCaptureService captureService = mock(CriticalErrorCaptureService.class);
    private final GlobalExceptionHandler handler = new GlobalExceptionHandler(captureService);

    @Test
    void handleAnyCapturesJournalAndKeepsSafeResponse() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/failing");
        IllegalStateException exception = new IllegalStateException("secret token=abc");

        var response = handler.handleAny(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("Unexpected error");
        verify(captureService).captureBackendUnhandled(
                exception,
                request,
                HttpStatus.INTERNAL_SERVER_ERROR,
                ErrorCode.INTERNAL_ERROR.getCode()
        );
    }

    @Test
    void captureFailureDoesNotChangeOriginalResponse() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/failing");
        IllegalStateException exception = new IllegalStateException("boom");
        doThrow(new IllegalStateException("journal failed"))
                .when(captureService)
                .captureBackendUnhandled(exception, request, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR.getCode());

        var response = handler.handleAny(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("Unexpected error");
    }
}
