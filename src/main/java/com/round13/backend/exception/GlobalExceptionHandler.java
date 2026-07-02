package com.round13.backend.exception;

import com.round13.backend.security.exception.JwtException;
import com.round13.backend.module.adminpanel.errorjournal.capture.CriticalErrorCaptureService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Глобальный обработчик ошибок API.
 * Возвращает единый формат: {code, message, httpStatus}.
 */
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private static final String VALIDATION_ERROR_CODE = "VALIDATION_ERROR";
    private static final String UNAUTHORIZED_CODE = "UNAUTHORIZED";
    private static final String ACCESS_DENIED_CODE = "ACCESS_DENIED";
    private static final String ACCESS_DENIED_MESSAGE = "Access denied";
    private static final String INVALID_REQUEST_PARAMETERS_MESSAGE = "Invalid request parameters";
    private static final String INVALID_REQUEST_BODY_MESSAGE = "Invalid request body";
    private static final String UNEXPECTED_ERROR_MESSAGE = "Unexpected error";

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final CriticalErrorCaptureService criticalErrorCaptureService;

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.debug("Invalid request param {}={}", ex.getName(), ex.getValue());
        return build(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST.getCode(), INVALID_REQUEST_PARAMETERS_MESSAGE);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleBodyValidation(MethodArgumentNotValidException ex) {
        return build(HttpStatus.BAD_REQUEST, VALIDATION_ERROR_CODE, INVALID_REQUEST_BODY_MESSAGE);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        return build(HttpStatus.BAD_REQUEST, VALIDATION_ERROR_CODE, INVALID_REQUEST_PARAMETERS_MESSAGE);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusiness(BusinessException ex) {
        HttpStatus status = ex.getHttpStatus();
        return build(status, ex.getErrorCode().getCode(), ex.getMessage());
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiErrorResponse> handleJwt(JwtException ex) {
        return build(HttpStatus.UNAUTHORIZED, UNAUTHORIZED_CODE, ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return build(HttpStatus.FORBIDDEN, ACCESS_DENIED_CODE, ACCESS_DENIED_MESSAGE);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleAny(Exception ex, HttpServletRequest request) {
        log.error("Unexpected error", ex);
        try {
            criticalErrorCaptureService.captureBackendUnhandled(
                    ex,
                    request,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    ErrorCode.INTERNAL_ERROR.getCode()
            );
        } catch (RuntimeException captureFailure) {
            log.warn("Critical error journal capture failed", captureFailure);
        }
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR.getCode(), UNEXPECTED_ERROR_MESSAGE);
    }

    private ResponseEntity<ApiErrorResponse> build(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status)
                .body(new ApiErrorResponse(code, message, status.value()));
    }
}
