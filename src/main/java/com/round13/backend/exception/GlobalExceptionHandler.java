package com.round13.backend.exception;

import com.round13.backend.security.exception.JwtException;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
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
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.debug("Invalid request param {}={}", ex.getName(), ex.getValue());
        return build(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "Invalid request parameters");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleBodyValidation(MethodArgumentNotValidException ex) {
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Invalid request body");
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Invalid request parameters");
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusiness(BusinessException ex) {
        HttpStatus status = ex.getHttpStatus();
        return build(status, ex.getCode().getCode(), ex.getMessage());
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiErrorResponse> handleJwt(JwtException ex) {
        return build(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleAny(Exception ex) {
        log.error("Unexpected error", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Unexpected error");
    }

    private ResponseEntity<ApiErrorResponse> build(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status)
                .body(new ApiErrorResponse(code, message, status.value()));
    }
}
