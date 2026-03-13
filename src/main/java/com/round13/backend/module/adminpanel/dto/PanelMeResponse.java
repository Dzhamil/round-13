package com.round13.backend.module.adminpanel.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class PanelMeResponse {
    private final UUID id;
    private final String login;
}
