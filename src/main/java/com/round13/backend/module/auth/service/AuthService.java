package com.round13.backend.module.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.round13.backend.domain.RefreshTokenEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.auth.dto.AuthTokensResponse;
import com.round13.backend.module.auth.dto.TelegramInitDataRequest;
import com.round13.backend.module.auth.dto.TelegramRecoveryRequest;
import com.round13.backend.module.auth.dto.TelegramAccountLinkRequest;
import com.round13.backend.module.auth.dto.PhonePasswordLoginRequest;
import com.round13.backend.module.auth.dto.TelegramUserDto;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.module.user.service.UserService;
import com.round13.backend.security.JwtService;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Сервис аутентификации пользователей.
 */
@Service
public class AuthService {

    private static final String ROLE_PREFIX = "ROLE_";

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;
    private final ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;
    private final RussianPhoneNormalizer phoneNormalizer;

    @Autowired
    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            UserService userService,
            ObjectMapper objectMapper,
            PasswordEncoder passwordEncoder,
            RussianPhoneNormalizer phoneNormalizer
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.userService = userService;
        this.objectMapper = objectMapper;
        this.passwordEncoder = passwordEncoder;
        this.phoneNormalizer = phoneNormalizer;
    }

    AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            UserService userService,
            ObjectMapper objectMapper,
            PasswordEncoder passwordEncoder
    ) {
        this(userRepository, jwtService, refreshTokenService, userService, objectMapper, passwordEncoder,
                new RussianPhoneNormalizer());
    }


    @Value("${security.refresh-token.ttl-days}")
    private long refreshTokenTtlDays;

    /**
     * Вход через Telegram WebApp.
     * initData валидируется в контроллере через TelegramInitDataValidationService.
     */
    @Transactional
    public AuthTokensResponse loginByTelegram(TelegramInitDataRequest request) {
        String userJson = TelegramInitDataUtils.extractUser(request.initData());
        TelegramUserDto tgUser = parseTelegramUser(userJson);
        UserEntity user = userService.findOrCreateByTelegramUserId(tgUser);
        validateUserForAuth(user);
        return issueTokens(user);
    }

    @Transactional
    public AuthTokensResponse loginByPhoneAndPassword(PhonePasswordLoginRequest request) {
        String phone = phoneNormalizer.normalize(request.phone())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        UserEntity user = userRepository.findByPhoneWithRole(phone)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        validateUserForAuth(user);
        return issueTokens(user);
    }

    /**
     * Привязывает неизвестного Telegram-пользователя к существующему web-аккаунту.
     * Подпись initData проверяется контроллером до вызова этого метода.
     */
    @Transactional
    public AuthTokensResponse linkTelegramAccount(TelegramAccountLinkRequest request) {
        TelegramUserDto telegramUser = parseTelegramUser(TelegramInitDataUtils.extractUser(request.initData()));

        // Повторный запрос от уже известного Telegram ID остаётся обычным Telegram-входом.
        var existingTelegramUser = userRepository
                .findTopByTelegramUserIdOrderByCreatedAtDesc(telegramUser.getId());
        if (existingTelegramUser.isPresent()) {
            UserEntity user = existingTelegramUser.get();
            validateUserForAuth(user);
            return issueTokens(user);
        }

        String phone = phoneNormalizer.normalize(request.phone())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        UserEntity user = userRepository.findByPhoneWithRoleForUpdate(phone)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        if (user.getTelegramUserId() != null && !user.getTelegramUserId().equals(telegramUser.getId())) {
            throw new BusinessException(ErrorCode.TELEGRAM_ACCOUNT_ALREADY_LINKED);
        }

        validateUserForAuth(user);
        user.setTelegramUserId(telegramUser.getId());
        return issueTokens(user);
    }

    @Transactional
    public AuthTokensResponse loginAfterContactRecovery(TelegramRecoveryRequest request) {
        TelegramUserDto tgUser = parseTelegramUser(TelegramInitDataUtils.extractUser(request.initData()));
        UserEntity user = userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(tgUser.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.TELEGRAM_RECOVERY_NOT_READY));
        validateUserForAuth(user);
        return issueTokens(user);
    }

    /**
     * Обновляет пару токенов по refresh-токену (rotation).
     * Старый refresh-токен помечается revoked.
     */
    @Transactional
    public AuthTokensResponse refresh(String rawRefreshToken) {
        RefreshTokenEntity token = refreshTokenService.findByHash(rawRefreshToken);

        if (token.isRevoked()) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_REVOKED);
        }
        if (token.isExpiredAt(OffsetDateTime.now())) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        UserEntity user = userRepository.findByIdWithRole(token.getUser().getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        validateUserForAuth(user);

        refreshTokenService.revoke(rawRefreshToken);

        return issueTokens(user);
    }

    /**
     * Завершает сессию пользователя: отзывает все refresh-токены пользователя.
     */
    @Transactional
    public void logout(UUID userId) {
        refreshTokenService.revokeAllByUserId(userId);
    }

    private TelegramUserDto parseTelegramUser(String rawUserJson) {
        if (rawUserJson == null || rawUserJson.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_TELEGRAM_INIT_DATA);
        }
        try {
            return objectMapper.readValue(rawUserJson, TelegramUserDto.class);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.INVALID_TELEGRAM_INIT_DATA);
        }
    }

    private void validateUserForAuth(UserEntity user) {
        if (user.isBlocked()) {
            throw new BusinessException(ErrorCode.USER_BLOCKED);
        }
        if (user.isDeleted()) {
            throw new BusinessException(ErrorCode.USER_DELETED);
        }
    }

    private AuthTokensResponse issueTokens(UserEntity user) {
        String role = ROLE_PREFIX + user.getRole().getCode();

        String accessToken = jwtService.generateAccessToken(
                String.valueOf(user.getId()),
                List.of(role)
        );

        OffsetDateTime refreshExpiresAt = OffsetDateTime.now().plusDays(refreshTokenTtlDays);
        String rawRefreshToken = UUID.randomUUID().toString() + UUID.randomUUID();

        String refreshToken = refreshTokenService.create(user, rawRefreshToken, refreshExpiresAt);
        return new AuthTokensResponse(accessToken, refreshToken);
    }
}
