package com.round13.backend.security.exception;

import java.io.Serial;

/**
 * Ошибка обработки JWT, которую API-слой аутентификации возвращает как отказ авторизации.
 */
public final class JwtException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    public JwtException(String message) {
        super(message);
    }

    public JwtException(String message, Throwable cause) {
        super(message, cause);
    }
}
