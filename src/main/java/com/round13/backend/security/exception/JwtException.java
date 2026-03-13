package com.round13.backend.security.exception;

/**
 * Исключение ошибок, связанных с JWT.
 */
public class JwtException extends RuntimeException {

    /**
     * Создаёт исключение с сообщением.
     */
    public JwtException(String message) {
        super(message);
    }

    /**
     * Создаёт исключение с сообщением и причиной.
     */
    public JwtException(String message, Throwable cause) {
        super(message, cause);
    }
}
