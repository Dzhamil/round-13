package com.round13.backend.module.members.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MemberUserLabelResolver {

    private final UserRepository userRepository;

    public String resolveByUserId(UUID userId) {
        if (userId == null) {
            return null;
        }

        return userRepository.findById(userId)
                .map(this::resolve)
                .orElse(null);
    }

    public String resolve(UserEntity user) {
        if (user == null) {
            return null;
        }
        if (user.getNickname() != null && !user.getNickname().isBlank()) {
            return user.getNickname();
        }
        if (!user.isPhoneHidden() && user.getPhone() != null && !user.getPhone().isBlank()) {
            return user.getPhone();
        }
        return null;
    }
}
