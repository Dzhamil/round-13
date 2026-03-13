package com.round13.backend.module.adminpanel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PanelLoginRequest {

    @NotBlank(message = "login is required")
    private String login;

    @NotBlank(message = "password is required")
    private String password;
}
