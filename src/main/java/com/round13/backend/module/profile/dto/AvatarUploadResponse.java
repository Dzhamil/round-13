package com.round13.backend.module.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Результат загрузки аватара")
public record AvatarUploadResponse(
        @Schema(description = "Публичный путь к аватару", example = "/uploads/avatars/user.jpg")
        String avatarUrl
) {
}
