// src/main/java/com/round13/backend/module/profile/service/ProfileService.java
package com.round13.backend.module.profile.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatus;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.profile.dto.MeResponse;
import com.round13.backend.module.profile.dto.UpdateAboutMeRequest;
import com.round13.backend.module.profile.dto.UpdateProfileRequest;
import com.round13.backend.module.profile.mapper.ProfileMapper;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;
    private final ProfileServiceUtil profileServiceUtil;

    @Transactional
    public MeResponse getMe(UUID userId) {
        UserEntity user = userRepository.findByIdWithRole(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ProfileEntity profile = getOrCreateProfile(user);

        profileServiceUtil.normalize(profile);
        profileServiceUtil.normalize(user);

        boolean completed = profileServiceUtil.isCompleted(profile, user);
        if (profile.isProfileCompleted() != completed) {
            profile.setProfileCompleted(completed);
            profileRepository.save(profile);
        }

        if (completed && Objects.equals(UserStatus.PROFILE_INCOMPLETE.name(), user.getStatus())) {
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
        } else {
            userRepository.save(user);
        }

        return profileMapper.toMeResponse(user, profile);
    }

    @Transactional
    public MeResponse updateMyProfile(UUID userId, UpdateProfileRequest request) {
        UserEntity user = userRepository.findByIdWithRole(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ProfileEntity profile = getOrCreateProfile(user);

        applyUserFields(user, request);
        profileMapper.updateProfile(request, profile);

        profileServiceUtil.normalize(profile);
        profileServiceUtil.normalize(user);

        boolean completed = profileServiceUtil.isCompleted(profile, user);
        profile.setProfileCompleted(completed);

        userRepository.save(user);
        profileRepository.save(profile);

        if (completed && user.getStatus() == UserStatus.PROFILE_INCOMPLETE) {
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
        }

        return profileMapper.toMeResponse(user, profile);
    }

    @Transactional
    public MeResponse completeProfile(UUID userId, UpdateProfileRequest request) {
        UserEntity user = userRepository.findByIdWithRole(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ProfileEntity profile = getOrCreateProfile(user);

        applyUserFields(user, request);
        profileMapper.updateProfile(request, profile);

        profileServiceUtil.normalize(profile);
        profileServiceUtil.normalize(user);

        boolean completed = profileServiceUtil.isCompleted(profile, user);
        profile.setProfileCompleted(completed);

        userRepository.save(user);
        profileRepository.save(profile);

        if (completed) {
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
        }

        return profileMapper.toMeResponse(user, profile);
    }

    /**
     * Обновляет поле "О себе" текущего пользователя.
     * Разрешено только после верификации телефона тренером/админом (users.phone_verified_by_staff = true).
     */
    @Transactional
    public MeResponse updateAboutMe(UUID userId, UpdateAboutMeRequest request) {
        UserEntity user = userRepository.findByIdWithRole(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // Флаг появится после миграции V20 + добавления поля в UserEntity.
        // Если флаг false — запрещаем редактирование.
        if (!user.isPhoneVerifiedByStaff()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        ProfileEntity profile = getOrCreateProfile(user);

        String normalized = profileServiceUtil.trimToNullValue(request.aboutMe());
        profile.setAboutMe(normalized);

        profileServiceUtil.normalize(profile);

        profileRepository.save(profile);
        userRepository.save(user);

        return profileMapper.toMeResponse(user, profile);
    }

    private ProfileEntity getOrCreateProfile(UserEntity user) {
        return profileRepository.findByUserId(user.getId())
                .orElseGet(() -> profileRepository.save(profileMapper.createEmpty(user)));
    }

    /**
     * ВАЖНО:
     * - сравниваем и проверяем уникальность по НОРМАЛИЗОВАННЫМ значениям;
     * - телефон нормализуем ДО поиска/проверки;
     * - ник сравниваем с нормализованным текущим значением (иначе пробелы/мусор дают ложную "смену").
     */
    private void applyUserFields(UserEntity user, UpdateProfileRequest request) {
        // nickname
        if (request.nickname() != null) {
            String newNick = profileServiceUtil.trimToNullValue(request.nickname());
            if (newNick != null) {
                String currentNick = profileServiceUtil.trimToNullValue(user.getNickname());
                if (!Objects.equals(newNick, currentNick)) {
                    if (userRepository.existsByNickname(newNick)) {
                        throw new BusinessException(ErrorCode.NICKNAME_EXISTS);
                    }
                    user.setNickname(newNick);
                }
            }
        }

        // phone
        if (request.phone() != null) {
            String newPhone = profileServiceUtil.normalizePhoneValue(request.phone());

            if (newPhone == null || !newPhone.matches("^\\+7\\d{10}$")) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST);
            }

            String currentPhone = profileServiceUtil.normalizePhoneValue(user.getPhone());
            if (!Objects.equals(newPhone, currentPhone)) {
                userRepository.findByPhone(newPhone).ifPresent(found -> {
                    if (!found.getId().equals(user.getId())) {
                        throw new BusinessException(ErrorCode.PHONE_EXISTS);
                    }
                });

                user.setPhone(newPhone);
            }
        }
    }
}
