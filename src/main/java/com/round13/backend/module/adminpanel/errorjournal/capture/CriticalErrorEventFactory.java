package com.round13.backend.module.adminpanel.errorjournal.capture;

import com.round13.backend.domain.CriticalErrorEventEntity;
import com.round13.backend.domain.CriticalErrorSeverity;
import com.round13.backend.domain.CriticalErrorSource;
import com.round13.backend.domain.CriticalErrorStatus;
import com.round13.backend.module.adminpanel.errorjournal.fingerprint.ErrorFingerprintService;
import com.round13.backend.module.adminpanel.errorjournal.sanitize.ErrorJournalSanitizer;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CriticalErrorEventFactory {

    private static final String ROLE_PANEL_ADMIN = "ROLE_PANEL_ADMIN";
    private static final String REQUEST_ID_HEADER = "X-Request-Id";

    private final ErrorJournalSanitizer sanitizer;
    private final ErrorFingerprintService fingerprintService;

    public CriticalErrorEventEntity backendUnhandled(
            Throwable throwable,
            HttpServletRequest request,
            HttpStatus httpStatus,
            String errorCode
    ) {
        String method = sanitizer.shortValue(request.getMethod(), 16);
        String path = sanitizer.requestPath(request.getRequestURI());
        String queryString = sanitizer.queryString(request.getQueryString());

        CriticalErrorEventEntity event = new CriticalErrorEventEntity();
        event.setOccurredAt(OffsetDateTime.now());
        event.setSeverity(CriticalErrorSeverity.ERROR);
        event.setSource(CriticalErrorSource.BACKEND);
        event.setStatus(CriticalErrorStatus.OPEN);
        event.setErrorCode(sanitizer.shortValue(errorCode, 64));
        event.setHttpStatus(httpStatus.value());
        event.setExceptionClass(exceptionClass(throwable));
        event.setErrorType(exceptionSimpleName(throwable));
        event.setMessage(sanitizer.message(throwable == null ? null : throwable.getMessage()));
        event.setStackTrace(sanitizer.stackTrace(throwable));
        event.setRequestMethod(method);
        event.setRequestPath(path);
        event.setQueryString(queryString);
        event.setRequestId(sanitizer.shortValue(request.getHeader(REQUEST_ID_HEADER), 128));
        event.setRemoteAddr(sanitizer.remoteAddr(request.getRemoteAddr()));
        event.setUserAgent(sanitizer.userAgent(request.getHeader("User-Agent")));
        event.setFingerprint(fingerprintService.fingerprint(
                CriticalErrorSource.BACKEND,
                throwable,
                method,
                path,
                errorCode,
                httpStatus.value()
        ));

        applyActor(event);
        return event;
    }

    public CriticalErrorEventEntity backendStatus(HttpServletRequest request, int httpStatus) {
        String method = sanitizer.shortValue(request.getMethod(), 16);
        String path = sanitizer.requestPath(request.getRequestURI());

        CriticalErrorEventEntity event = new CriticalErrorEventEntity();
        event.setOccurredAt(OffsetDateTime.now());
        event.setSeverity(CriticalErrorSeverity.ERROR);
        event.setSource(CriticalErrorSource.BACKEND);
        event.setStatus(CriticalErrorStatus.OPEN);
        event.setErrorCode("HTTP_" + httpStatus);
        event.setHttpStatus(httpStatus);
        event.setErrorType("HTTP_STATUS");
        event.setMessage("HTTP " + httpStatus + " response without captured exception");
        event.setRequestMethod(method);
        event.setRequestPath(path);
        event.setQueryString(sanitizer.queryString(request.getQueryString()));
        event.setRequestId(sanitizer.shortValue(request.getHeader(REQUEST_ID_HEADER), 128));
        event.setRemoteAddr(sanitizer.remoteAddr(request.getRemoteAddr()));
        event.setUserAgent(sanitizer.userAgent(request.getHeader("User-Agent")));
        event.setFingerprint(fingerprintService.fingerprint(
                CriticalErrorSource.BACKEND,
                null,
                method,
                path,
                event.getErrorCode(),
                httpStatus
        ));

        applyActor(event);
        return event;
    }

    private String exceptionClass(Throwable throwable) {
        return throwable == null ? null : sanitizer.shortValue(throwable.getClass().getName(), 256);
    }

    private String exceptionSimpleName(Throwable throwable) {
        return throwable == null ? null : sanitizer.shortValue(throwable.getClass().getSimpleName(), 128);
    }

    private void applyActor(CriticalErrorEventEntity event) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return;
        }

        UUID principalId = parseUuid(authentication.getName());
        if (principalId == null) {
            return;
        }

        boolean panelAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(ROLE_PANEL_ADMIN::equals);

        if (panelAdmin) {
            event.setPanelAdminId(principalId);
        } else {
            event.setActorUserId(principalId);
        }
    }

    private UUID parseUuid(String value) {
        try {
            return UUID.fromString(value);
        } catch (RuntimeException ignored) {
            return null;
        }
    }
}
