package com.round13.backend.module.sheets.integration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class SheetsErrors {
    private SheetsErrors() {}

    static ResponseStatusException unavailable(String message, Throwable cause) {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, message, cause);
    }
}
