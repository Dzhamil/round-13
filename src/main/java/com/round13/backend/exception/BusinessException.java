package com.round13.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Базовое бизнес-исключение приложения.
 * Строится на основе {@link ErrorCode}.
 */
@Getter
public class BusinessException extends RuntimeException {

    /**
     * Машиночитаемый код ошибки.
     */
    private final ErrorCode code;

    /**
     * HTTP статус ответа.
     */
    private final HttpStatus httpStatus;

    /**
     * Создаёт бизнес-исключение по коду ошибки.
     */
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
    }
}
