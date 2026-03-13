package com.round13.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Единый DTO ответа об ошибке API.
 * Используется для всех типов ошибок: business, security, validation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiErrorResponse {

    /**
     * Машиночитаемый код ошибки.
     * Используется клиентами для обработки сценариев.
     */
    private String code;

    /**
     * Человекочитаемое описание ошибки.
     * Предназначено для отображения пользователю.
     */
    private String message;

    /**
     * HTTP статус ответа.
     * Дублируется в теле для удобства клиентов.
     */
    private int httpStatus;
}
