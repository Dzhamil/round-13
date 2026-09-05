package com.round13.backend.module.adminpanel.service;

import com.round13.backend.domain.*;
import com.round13.backend.exception.*;
import com.round13.backend.module.adminpanel.controller.dto.*;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.*;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class PanelManualUserService {
    private static final String PASSWORD_ALPHABET =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    private static final int GENERATED_PASSWORD_LENGTH = 14;

    private final UserRepository users;
    private final RoleRepository roles;
    private final ProfileRepository profiles;
    private final PasswordEncoder encoder;
    private final RussianPhoneNormalizer normalizer;
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public PanelCreateUserResponse create(PanelCreateUserRequest request) {
        String phone = normalizer.normalize(request.phone())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_PHONE_FORMAT));
        if (users.existsByPhone(phone)) {
            throw new BusinessException(ErrorCode.PHONE_EXISTS);
        }

        String nickname = trim(request.telegramNickname());
        if (nickname != null && users.existsByNickname(nickname)) {
            throw new BusinessException(ErrorCode.NICKNAME_EXISTS);
        }

        String password = request.generatePassword() ? generatePassword() : request.password();
        UserEntity user = new UserEntity();
        user.setPhone(phone);
        user.setNickname(nickname);
        user.setPasswordHash(encoder.encode(password));
        user.setRole(roles.findByCode(request.roleCode())
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND)));
        user.setStatus(UserStatus.ACTIVE);
        user = users.save(user);

        ProfileEntity profile = new ProfileEntity();
        profile.setUser(user);
        profile.setSurname(request.surname().trim());
        profile.setFirstName(request.firstName().trim());
        profile.setPatronymic(trim(request.patronymic()));
        profile.setFullName(buildFullName(profile));
        profile.setProfileCompleted(false);
        profiles.save(profile);

        return new PanelCreateUserResponse(user.getId(), password);
    }

    private String generatePassword() {
        StringBuilder password = new StringBuilder(GENERATED_PASSWORD_LENGTH);
        for (int i = 0; i < GENERATED_PASSWORD_LENGTH; i++) {
            password.append(PASSWORD_ALPHABET.charAt(random.nextInt(PASSWORD_ALPHABET.length())));
        }
        return password.toString();
    }

    private String buildFullName(ProfileEntity profile) {
        return Stream.of(
                        profile.getSurname(), profile.getFirstName(), profile.getPatronymic()
                )
                .filter(Objects::nonNull)
                .collect(Collectors.joining(" "));
    }

    private String trim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
