package com.round13.backend.module.auth.repo;

import com.round13.backend.domain.RefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

/**
 * Репозиторий refresh-токенов.
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, UUID> {

    /**
     * Возвращает refresh-токен по хэшу токена.
     */
    Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);

    /**
     * Отзывает refresh-токен по хэшу (revoked=true).
     *
     * @return количество обновлённых строк (0 если не найден/уже revoked)
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update RefreshTokenEntity t
               set t.revoked = true
             where t.tokenHash = :tokenHash
               and t.revoked = false
            """)
    int revokeByTokenHash(@Param("tokenHash") String tokenHash);

    /**
     * Отзывает все refresh-токены пользователя.
     *
     * @return количество обновлённых строк
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update RefreshTokenEntity t
               set t.revoked = true
             where t.user.id = :userId
               and t.revoked = false
            """)
    int revokeAllByUserId(@Param("userId") UUID userId);

}
