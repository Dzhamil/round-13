package com.round13.backend.module.members.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Операционный статус ученика для тренера")
public enum StudentOperationalStatusCode {
    ACTIVE,
    RISK,
    LONG_ABSENT
}
