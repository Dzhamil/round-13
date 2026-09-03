package com.round13.backend.module.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record PhonePasswordLoginRequest(
        @NotBlank String phone,
        @NotBlank String password
) {
}
