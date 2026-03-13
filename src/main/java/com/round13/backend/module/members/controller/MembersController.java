package com.round13.backend.module.members.controller;

import com.round13.backend.module.members.dto.MembersGroup;
import com.round13.backend.module.members.dto.MembersListResponse;
import com.round13.backend.module.members.service.MembersService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Контроллер "Участники клуба".
 */
@RestController
@RequestMapping(MembersController.BASE_PATH)
@RequiredArgsConstructor
@Tag(name = "Members", description = "Участники клуба (бойцы и тренерский состав)")
public class MembersController {

    public static final String BASE_PATH = "/api/members";

    private final MembersService membersService;

    @Operation(summary = "Получить список участников клуба (бойцы / тренеры)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Список получен"),
            @ApiResponse(responseCode = "400", description = "Некорректный параметр group")
    })
    @GetMapping
    public MembersListResponse getMembers(
            @Parameter(description = "Группа: FIGHTERS или COACHES", example = "FIGHTERS")
            @RequestParam(name = "group", required = false, defaultValue = "FIGHTERS")
            MembersGroup group
    ) {
        return membersService.getMembers(group);
    }

    @Operation(summary = "Получить список моих учеников")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Список учеников получен"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    @GetMapping("/my-students")
    public MembersListResponse getMyStudents(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return membersService.getMyStudents(userId);
    }
}