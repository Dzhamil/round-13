package com.round13.backend.module.adminpanel.controller.dto;
import java.util.UUID;
public record PanelCreateUserResponse(UUID userId, String issuedPassword) {}
