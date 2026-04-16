package com.round13.backend.exception;

/**
 * Единый DTO ответа об ошибке API.
 * Используется для всех типов ошибок: business, security, validation.
 */
public record ApiErrorResponse(
        String code,
        String message,
        int httpStatus
) {
}
