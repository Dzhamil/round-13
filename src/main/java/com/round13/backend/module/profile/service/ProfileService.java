package com.round13.backend.module.profile.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
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
    private final ProfileEntitlementService profileEntitlementService;

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

        if (completed && user.isProfileIncomplete()) {
            user.activate();
        }
        userRepository.save(user);

        return enrich(profileMapper.toMeResponse(user, profile), userId);
    }

    @Transactional
    public MeResponse updateMyProfile(UUID userId, UpdateProfileRequest request) {
        UserEntity user = userRepository.findByIdWithRole(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ProfileEntity profile = getOrCreateProfile(user);

        applyUserFields(user, request);
        profileMapper.updateProfile(request, profile);
        updateFullName(profile);

        profileServiceUtil.normalize(profile);
        profileServiceUtil.normalize(user);

        boolean completed = profileServiceUtil.isCompleted(profile, user);
        profile.setProfileCompleted(completed);

        userRepository.save(user);
        profileRepository.save(profile);

        if (completed && user.isProfileIncomplete()) {
            user.activate();
            userRepository.save(user);
        }

        return enrich(profileMapper.toMeResponse(user, profile), userId);
    }

    @Transactional
    public MeResponse completeProfile(UUID userId, UpdateProfileRequest request) {
        UserEntity user = userRepository.findByIdWithRole(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ProfileEntity profile = getOrCreateProfile(user);

        applyUserFields(user, request);
        profileMapper.updateProfile(request, profile);
        updateFullName(profile);

        profileServiceUtil.normalize(profile);
        profileServiceUtil.normalize(user);

        boolean completed = profileServiceUtil.isCompleted(profile, user);
        profile.setProfileCompleted(completed);

        userRepository.save(user);
        profileRepository.save(profile);

        if (completed) {
            user.activate();
            userRepository.save(user);
        }

        return enrich(profileMapper.toMeResponse(user, profile), userId);
    }

    /**
     * Обновляет поле "О себе" текущего пользователя.
     */
    @Transactional
    public MeResponse updateAboutMe(UUID userId, UpdateAboutMeRequest request) {
        UserEntity user = userRepository.findByIdWithRole(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ProfileEntity profile = getOrCreateProfile(user);

        String normalized = profileServiceUtil.trimToNullValue(request.aboutMe());
        profile.setAboutMe(normalized);

        profileServiceUtil.normalize(profile);

        profileRepository.save(profile);
        userRepository.save(user);

        return enrich(profileMapper.toMeResponse(user, profile), userId);
    }

    private ProfileEntity getOrCreateProfile(UserEntity user) {
        return profileRepository.findByUserId(user.getId())
                .orElseGet(() -> profileRepository.save(profileMapper.createEmpty(user)));
    }

    private MeResponse enrich(MeResponse response, UUID userId) {
        response.setEntitlements(profileEntitlementService.getActiveEntitlements(userId));
        return response;
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

        if (request.phoneHidden() != null) {
            user.setPhoneHidden(request.phoneHidden());
        }
    }

    private void updateFullName(ProfileEntity profile) {
        java.util.List<String> parts = java.util.stream.Stream.of(profile.getSurname(), profile.getFirstName(), profile.getPatronymic())
                .filter(Objects::nonNull).map(String::trim).filter(value -> !value.isBlank()).toList();
        if (!parts.isEmpty()) profile.setFullName(String.join(" ", parts));
    }
}
