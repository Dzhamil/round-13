package com.round13.backend.module.members.controller;

import com.round13.backend.module.members.dto.MembersListResponse;
import com.round13.backend.module.members.service.MembersService;
import com.round13.backend.module.members.service.TrainerStudentRelationshipService;
import com.round13.backend.security.AuthenticationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/trainer-student-links")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Trainer Student Links", description = "Админское управление связями тренер-ученик")
public class AdminTrainerStudentLinksController {

    private final MembersService membersService;
    private final TrainerStudentRelationshipService trainerStudentRelationshipService;

    @Operation(summary = "Получить список связей тренер-ученик для админа")
    @GetMapping
    public MembersListResponse getTrainerStudentLinks(
            @Parameter(description = "Опциональный фильтр по ID тренера")
            @RequestParam(required = false) UUID trainerId
    ) {
        return membersService.getTrainerStudentLinksForAdmin(trainerId);
    }

    @Operation(summary = "Убрать ученика из конкретного списка тренера без удаления профиля")
    @DeleteMapping("/{trainerStudentLinkId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeTrainerStudentLink(
            Authentication authentication,
            @Parameter(description = "ID связи тренер-ученик")
            @PathVariable UUID trainerStudentLinkId
    ) {
        UUID adminUserId = AuthenticationUtils.getUserId(authentication);
        trainerStudentRelationshipService.removeAsAdmin(adminUserId, trainerStudentLinkId);
    }
}
