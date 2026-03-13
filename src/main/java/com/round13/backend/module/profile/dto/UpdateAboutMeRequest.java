// src/main/java/com/round13/backend/module/profile/dto/UpdateAboutMeRequest.java
package com.round13.backend.module.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

/**
 * Запрос на обновление поля "О себе".
 */
@Schema(description = "Запрос на обновление поля 'О себе'")
public record UpdateAboutMeRequest(

        @Schema(description = "Текст 'О себе' (null/пусто = очистить)", example = "Люблю спарринги и тяжёлые раунды")
        @Size(max = 2000)
        String aboutMe

) {}
