package com.round13.backend.module.profile.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatus;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Checks persisted identity fields, never trusting a token or a legacy completion flag. */
@Service
@RequiredArgsConstructor
public class ProfileAccessService {
    private final ProfileRepository profiles;
    private final UserRepository users;
    private final ProfileServiceUtil rules;

    @Transactional
    public boolean requiresCompletion(UserEntity user) {
        if (user.isDeleted() || user.isBlocked()) return false;
        var profile = profiles.findByUserId(user.getId()).orElseGet(ProfileEntity::new);
        if (!rules.isCompleted(profile, user) && user.getStatus() == UserStatus.ACTIVE) {
            user.setStatus(UserStatus.PROFILE_INCOMPLETE);
            users.save(user);
        }
        // Only an explicit profile save activates an incomplete account.
        return user.isProfileIncomplete();
    }
}
