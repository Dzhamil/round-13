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
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileCommandService {

    private final ApplicationEventPublisher events;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;
    private final ProfileServiceUtil profileServiceUtil;
    private final ProfileEntitlementService profileEntitlementService;

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

        if (completed && user.isProfileIncomplete()) {
            user.activate();
        }
        userRepository.save(user);
        profileRepository.save(profile);

        events.publishEvent(new ProfileSaved(userId));
        return enrich(profileMapper.toMeResponse(user, profile), user, profile);
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

        events.publishEvent(new ProfileSaved(userId));
        return enrich(profileMapper.toMeResponse(user, profile), user, profile);
    }

    private ProfileEntity getOrCreateProfile(UserEntity user) {
        return profileRepository.findByUserId(user.getId())
                .orElseGet(() -> profileRepository.save(profileMapper.createEmpty(user)));
    }

    private MeResponse enrich(MeResponse response, UserEntity user, ProfileEntity profile) {
        var missing = profileServiceUtil.missingFields(profile, user);
        response.setProfileMissingFields(missing);
        response.setProfileCompleted(missing.isEmpty());
        response.setEntitlements(profileEntitlementService.getActiveEntitlements(user.getId()));
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
