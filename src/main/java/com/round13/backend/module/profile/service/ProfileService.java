package com.round13.backend.module.profile.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.profile.dto.MeResponse;
import com.round13.backend.module.profile.mapper.ProfileMapper;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;
    private final ProfileServiceUtil profileServiceUtil;
    private final ProfileEntitlementService profileEntitlementService;

    @Transactional(readOnly = true)
    public MeResponse getMe(UUID userId) {
        var user = userRepository.findByIdWithRole(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        // A missing legacy row is represented in memory; reads never repair persistence.
        var profile = profileRepository.findByUserId(userId).orElseGet(ProfileEntity::new);
        var response = profileMapper.toMeResponse(user, profile);
        var missing = profileServiceUtil.missingFields(profile, user);
        response.setProfileMissingFields(missing);
        response.setProfileCompleted(missing.isEmpty());
        response.setEntitlements(profileEntitlementService.getActiveEntitlements(userId));
        return response;
    }
}
