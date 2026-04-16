package com.round13.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.io.Serial;
import java.util.Objects;

/**
 * Базовое бизнес-исключение приложения.
 * Строится на основе {@link ErrorCode}.
 */
@Getter
public class BusinessException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * Машиночитаемый код ошибки.
     */
    private final ErrorCode errorCode;

    /**
     * Создаёт бизнес-исключение по коду ошибки.
     */
    public BusinessException(ErrorCode errorCode) {
        super(Objects.requireNonNull(errorCode, "errorCode must not be null").getMessage());
        this.errorCode = errorCode;
    }

    public HttpStatus getHttpStatus() {
        return errorCode.getHttpStatus();
    }
}
