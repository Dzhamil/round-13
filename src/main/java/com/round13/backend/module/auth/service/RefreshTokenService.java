package com.round13.backend.module.auth.service;

import com.round13.backend.domain.RefreshTokenEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.auth.mapper.RefreshTokenMapper;
import com.round13.backend.module.auth.repo.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Сервис refresh-токенов.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenMapper refreshTokenMapper;
    private final TokenHashService tokenHashService;

    /**
     * Создаёт refresh-токен: сохраняет hash(rawToken) в БД, возвращает rawToken клиенту.
     */
    @Transactional
    public String create(UserEntity user, String rawToken, OffsetDateTime expiresAt) {
        RefreshTokenEntity entity = refreshTokenMapper.toEntity(user, rawToken, expiresAt, tokenHashService);
        refreshTokenRepository.save(entity);
        return rawToken;
    }

    /**
     * Ищет refresh-токен по rawToken (через хэш).
     */
    @Transactional(readOnly = true)
    public RefreshTokenEntity findByHash(String rawToken) {
        String hash = tokenHashService.hash(rawToken);

        return refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BusinessException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));
    }

    /**
     * Отзывает refresh-токен по rawToken.
     */
    @Transactional
    public void revoke(String rawToken) {
        String hash = tokenHashService.hash(rawToken);

        int updated = refreshTokenRepository.revokeByTokenHash(hash);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
        }
    }

    /**
     * Отзывает все refresh-токены пользователя.
     */
    @Transactional
    public void revokeAllByUserId(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }
}
