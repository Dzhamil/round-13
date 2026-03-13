// src/main/java/com/round13/backend/module/members/controller/MemberDetailsController.java
package com.round13.backend.module.members.controller;

import com.round13.backend.module.members.dto.MemberDetailsResponse;
import com.round13.backend.module.members.service.MemberDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Контроллер детальной карточки участника.
 */
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@Tag(name = "Members", description = "Участники клуба (бойцы и тренерский состав)")
public class MemberDetailsController {

    private final MemberDetailsService memberDetailsService;

    @Operation(summary = "Получить детальную карточку участника клуба")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Карточка получена"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    @GetMapping("/{id}")
    public MemberDetailsResponse getMemberDetails(
            @Parameter(description = "ID пользователя", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable("id") UUID id,
            Authentication authentication
    ) {
        UUID currentUserId = null;
        if (authentication != null) {
            try {
                currentUserId = UUID.fromString(authentication.getName());
            } catch (Exception ignored) {
                // ignore malformed UUIDs
            }
        }
        return memberDetailsService.getMemberDetails(id, currentUserId);
    }
}