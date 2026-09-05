package com.round13.backend.module.adminpanel.controller.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PanelCreateUserRequest(
        @NotBlank @Size(max = 128) String surname,
        @NotBlank @Size(max = 128) String firstName,
        @Size(max = 128) String patronymic,
        @NotBlank @Size(max = 32) String phone,
        @Size(max = 64) String telegramNickname,
        String password,
        boolean generatePassword,
        @NotBlank @Pattern(regexp = "ATHLETE|COACH|ADMIN") String roleCode
) {
    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final int MAX_PASSWORD_LENGTH = 72;

    @AssertTrue(message = "Пароль должен содержать от 8 до 72 символов")
    public boolean isPasswordValid() {
        return generatePassword || password != null
                && password.length() >= MIN_PASSWORD_LENGTH
                && password.length() <= MAX_PASSWORD_LENGTH;
    }
}
