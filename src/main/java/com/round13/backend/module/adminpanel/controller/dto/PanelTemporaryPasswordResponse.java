package com.round13.backend.module.adminpanel.controller.dto;

import java.util.UUID;

public record PanelTemporaryPasswordResponse(UUID userId, String issuedPassword) {
}
