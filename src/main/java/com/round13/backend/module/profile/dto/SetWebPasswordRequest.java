package com.round13.backend.module.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SetWebPasswordRequest(
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank String passwordConfirmation
) {
}
