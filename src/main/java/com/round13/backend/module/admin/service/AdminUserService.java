package com.round13.backend.module.admin.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.RoleEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatus;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.admin.dto.CreateUserRequest;
import com.round13.backend.module.admin.dto.UserDetailsResponse;
import com.round13.backend.module.admin.dto.UserListItemResponse;
import com.round13.backend.module.admin.mapper.AdminUserMapper;
import com.round13.backend.module.admin.mapper.UserMapper;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.RoleRepository;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AdminUserMapper adminUserMapper;
    private final RussianPhoneNormalizer phoneNormalizer;

    @Transactional
    public void createUser(CreateUserRequest request) {
        String normalizedPhone = phoneNormalizer.normalize(request.getPhone())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REQUEST));
        if (userRepository.existsByPhone(normalizedPhone)) {
            throw new BusinessException(ErrorCode.PHONE_EXISTS);
        }

        if (request.getNickname() != null && !request.getNickname().isBlank()
                && userRepository.existsByNickname(request.getNickname())) {
            throw new BusinessException(ErrorCode.NICKNAME_EXISTS);
        }

        RoleEntity role = roleRepository.findByCode(request.getRoleCode())
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));

        UserEntity user = userMapper.toEntity(request, role, passwordEncoder);
        user.setPhone(normalizedPhone);

        userRepository.save(user);

        ProfileEntity profile = new ProfileEntity();
        profile.setUser(user);
        profile.setProfileCompleted(false);

        profileRepository.save(profile);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<UserListItemResponse> getUsers() {
        List<UserEntity> users = userRepository.findAllWithRole();

        Map<UUID, ProfileEntity> profilesByUserId = profileRepository
                .findByUserIdIn(users.stream().map(UserEntity::getId).toList())
                .stream()
                .collect(Collectors.toMap(p -> p.getUser().getId(), Function.identity()));

        return users.stream()
                .map(user -> adminUserMapper.toListItem(
                        user,
                        profilesByUserId.getOrDefault(user.getId(), emptyProfile(user))
                ))
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public UserDetailsResponse getUser(UUID userId) {
        UserEntity user = userRepository.findByIdWithRole(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ProfileEntity profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> emptyProfile(user));

        return adminUserMapper.toDetails(user, profile);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void updateUserRole(UUID adminUserId, UUID targetUserId, String roleCode) {
        if (adminUserId.equals(targetUserId)) {
            throw new BusinessException(ErrorCode.ADMIN_CANNOT_CHANGE_OWN_ROLE);
        }

        String normalizedRoleCode = roleCode == null ? null : roleCode.trim();
        if (normalizedRoleCode == null || normalizedRoleCode.isBlank()) {
            throw new BusinessException(ErrorCode.ROLE_NOT_FOUND);
        }

        RoleEntity role = roleRepository.findByCode(normalizedRoleCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));

        UserEntity user = userRepository.findByIdWithRole(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        user.setRole(role);
        userRepository.save(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void updateUserStatus(UUID adminUserId, UUID targetUserId, UserStatus status) {
        if (status == UserStatus.DELETED) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        if (adminUserId.equals(targetUserId) && status == UserStatus.BLOCKED) {
            throw new BusinessException(ErrorCode.ADMIN_CANNOT_BLOCK_SELF);
        }

        UserEntity user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        user.setStatus(status);
        userRepository.save(user);
    }

    /**
     * Верификация телефона тренером/админом.
     * Выставляет users.phone_verified_by_staff.
     */
    @PreAuthorize("hasAnyRole('ADMIN','COACH')")
    @Transactional
    public void setPhoneVerifiedByStaff(UUID targetUserId, boolean verified) {
        UserEntity user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        user.setPhoneVerifiedByStaff(verified);
        userRepository.save(user);
    }

    private ProfileEntity emptyProfile(UserEntity user) {
        ProfileEntity p = new ProfileEntity();
        p.setUser(user);
        p.setProfileCompleted(false);
        return p;
    }
}
