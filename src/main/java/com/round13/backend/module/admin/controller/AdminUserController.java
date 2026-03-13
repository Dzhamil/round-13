package com.round13.backend.module.admin.controller;

import com.round13.backend.module.admin.dto.CreateUserRequest;
import com.round13.backend.module.admin.dto.UpdatePhoneVerifiedByStaffRequest;
import com.round13.backend.module.admin.dto.UpdateUserRoleRequest;
import com.round13.backend.module.admin.dto.UpdateUserStatusRequest;
import com.round13.backend.module.admin.dto.UserDetailsResponse;
import com.round13.backend.module.admin.dto.UserListItemResponse;
import com.round13.backend.module.admin.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Контроллер для управления пользователями администратором.
 */
@Tag(name = "Admin Users", description = "Управление пользователями")
@RestController
@RequestMapping(AdminUserController.BASE_PATH)
@RequiredArgsConstructor
public class AdminUserController {

    public static final String BASE_PATH = "/api/admin/users";

    private final AdminUserService adminUserService;

    /**
     * Возвращает список пользователей.
     */
    @Operation(summary = "Получить список пользователей")
    @GetMapping
    public List<UserListItemResponse> getUsers() {
        return adminUserService.getUsers();
    }

    /**
     * Возвращает детальную информацию о пользователе.
     */
    @Operation(summary = "Получить пользователя по id")
    @GetMapping("/{userId}")
    public UserDetailsResponse getUser(@PathVariable UUID userId) {
        return adminUserService.getUser(userId);
    }

    /**
     * Создает пользователя с указанной ролью.
     */
    @Operation(summary = "Создать пользователя")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createUser(@Valid @RequestBody CreateUserRequest request) {
        adminUserService.createUser(request);
    }

    /**
     * Назначить роль пользователю.
     */
    @Operation(summary = "Изменить роль пользователя")
    @PatchMapping("/{userId}/role")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateUserRole(
            Authentication authentication,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        UUID adminUserId = UUID.fromString(authentication.getName());
        adminUserService.updateUserRole(
                adminUserId,
                userId,
                request.getRoleCode()
        );
    }

    /**
     * Изменяет статус пользователя.
     */
    @Operation(summary = "Изменить статус пользователя")
    @PatchMapping("/{userId}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateUserStatus(
            Authentication authentication,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        UUID adminUserId = UUID.fromString(authentication.getName());
        adminUserService.updateUserStatus(
                adminUserId,
                userId,
                request.getStatus()
        );
    }

    /**
     * Верификация телефона тренером/админом:
     * выставляет users.phone_verified_by_staff (разрешает редактировать "О себе").
     */
    @Operation(summary = "Установить флаг phone_verified_by_staff")
    @PatchMapping("/{userId}/phone-verified-by-staff")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setPhoneVerifiedByStaff(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdatePhoneVerifiedByStaffRequest request
    ) {
        adminUserService.setPhoneVerifiedByStaff(userId, request.getVerified());
    }
}
