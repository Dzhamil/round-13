package com.round13.backend.module.adminpanel.controller.dto;

import jakarta.validation.constraints.*;

public record PanelCreateUserRequest(
        @NotBlank @Size(max=128) String surname,
        @NotBlank @Size(max=128) String firstName,
        @Size(max=128) String patronymic,
        @NotBlank @Size(max=32) String phone,
        @Size(max=64) String telegramNickname,
        @Size(min=8,max=72) String password,
        boolean generatePassword,
        @NotBlank @Pattern(regexp="ATHLETE|COACH|ADMIN") String roleCode) {}
