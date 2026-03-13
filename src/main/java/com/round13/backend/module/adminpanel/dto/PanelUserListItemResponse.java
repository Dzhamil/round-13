package com.round13.backend.module.adminpanel.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
@Schema(description = "Элемент списка пользователей в админ-панели")
public class PanelUserListItemResponse {

    @Schema(description = "Уникальный идентификатор пользователя", example = "550e8400-e29b-41d4-a716-446655440000")
    private final UUID id;

    @Schema(description = "Никнейм пользователя", example = "john_doe")
    private final String nickname;

    @Schema(description = "Номер телефона пользователя", example = "+77001234567")
    private final String phone;

    @Schema(description = "Статус пользователя", example = "ACTIVE")
    private final String status;

    @Schema(description = "Код роли пользователя", example = "ADMIN")
    private final String roleCode;
}
