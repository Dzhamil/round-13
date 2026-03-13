package com.round13.backend.module.user.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.RoleEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatsEntity;
import com.round13.backend.module.auth.dto.TelegramUserDto;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.user.mapper.TelegramUserMapper;
import com.round13.backend.module.profile.mapper.ProfileMapper;
import com.round13.backend.module.user.dto.UserProfileBundle;
import com.round13.backend.module.user.dto.UserProfileResponse;
import com.round13.backend.module.user.mapper.UserProfileResponseMapper;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.module.members.repo.UserStatsCacheRepository;
import com.round13.backend.module.members.service.MemberPointsCacheService;
import com.round13.backend.module.members.service.UserStatsFactory;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Сервис пользователей.
 *
 * создание/поиск пользователя при Telegram-авторизации и получение публичного профиля участника.</p>
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private static final String DEFAULT_ROLE_CODE = "ATHLETE";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProfileRepository profileRepository;
    private final UserStatsCacheRepository userStatsCacheRepository;
    private final TelegramUserMapper telegramUserMapper;
    private final ProfileMapper profileMapper;
    private final UserProfileResponseMapper userProfileResponseMapper;
    private final UserStatsFactory userStatsFactory;
    private final MemberPointsCacheService memberPointsCacheService;

    /**
     * Находит пользователя по Telegram userId или создаёт нового.
     */
    @Transactional
    public UserEntity findOrCreateByTelegramUserId(TelegramUserDto tgUser) {
        if (tgUser == null || tgUser.getId() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        Long tgId = tgUser.getId();

        return userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(tgId)
                .orElseGet(() -> {
                    try {
                        return createTelegramUser(tgUser);
                    } catch (DataIntegrityViolationException e) {
                        return userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(tgId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR));
                    }
                });
    }


    /**
     * Возвращает публичный профиль участника по его id.
     */
    @Transactional
    public UserProfileResponse getUserProfile(UUID targetUserId) {
        if (targetUserId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        memberPointsCacheService.recalcForUser(targetUserId);

        UserProfileBundle bundle = userRepository.findUserProfileBundle(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        UserStatsEntity stats = bundle.stats();
        ProfileEntity profile = bundle.profile();
        UserEntity user = bundle.user();

        if (profile == null) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }

        if (stats == null) {
            return userProfileResponseMapper.toResponseWithoutStats(user, profile);
        }
        return userProfileResponseMapper.toResponse(user, profile, stats);
    }

    private UserEntity createTelegramUser(TelegramUserDto tgUser) {
        RoleEntity role = roleRepository.findByCode(DEFAULT_ROLE_CODE)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));
        UserEntity user = telegramUserMapper.toEntity(tgUser, role);
        user = userRepository.save(user);
        ProfileEntity profile = profileMapper.createEmpty(user);
        profileRepository.save(profile);
        userStatsCacheRepository.save(userStatsFactory.createEmpty(user));
        return user;
    }
}
