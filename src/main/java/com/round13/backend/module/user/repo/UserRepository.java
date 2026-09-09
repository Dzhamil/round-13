// src/main/java/com/round13/backend/module/user/repo/UserRepository.java
package com.round13.backend.module.user.repo;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.user.dto.UserProfileBundle;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Репозиторий для чтения и сохранения пользователей.
 */
public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    /**
     * Возвращает пользователя по номеру телефона.
     * Телефон больше не является основным идентификатором входа (Telegram WebApp auth),
     * но может использоваться в админских сценариях/профиле/миграциях.
     */
    Optional<UserEntity> findByPhone(String phone);

    @Query("select u from UserEntity u join fetch u.role where u.phone = :phone")
    Optional<UserEntity> findByPhoneWithRole(String phone);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from UserEntity u join fetch u.role where u.phone = :phone")
    Optional<UserEntity> findByPhoneWithRoleForUpdate(@Param("phone") String phone);

    /**
     * Возвращает пользователя по id вместе с ролью.
     */
    @Query("""
            select u
            from UserEntity u
            join fetch u.role r
            where u.id = :id
            """)
    Optional<UserEntity> findByIdWithRole(@Param("id") UUID id);

    /**
     * Проверяет существование пользователя по номеру телефона.
     * Может быть нужен админке/профилю, пока телефон сохраняется в схеме.
     */
    boolean existsByPhone(String phone);

    /**
     * Проверяет существование пользователя по никнейму.
     */
    boolean existsByNickname(String nickname);

    /**
     * Возвращает список всех пользователей вместе с их ролью.
     */
    @Query("""
            select u
            from UserEntity u
            join fetch u.role r
            order by u.createdAt desc
            """)
    List<UserEntity> findAllWithRole();

    /**
     * Загружает пользователя вместе с его профилем и статистикой одним запросом (LEFT JOIN).
     * Возвращает массив: [UserEntity, ProfileEntity|null, UserStatsEntity|null].
     */
    @Query("""
                select new com.round13.backend.module.user.dto.UserProfileBundle(u, p, s)
                from UserEntity u
                join fetch u.role
                left join ProfileEntity p on p.user = u
                left join UserStatsEntity s on s.user = u
                where u.id = :id
                  and u.status <> com.round13.backend.domain.UserStatus.DELETED
            """)
    Optional<UserProfileBundle> findUserProfileBundle(@Param("id") UUID id);

    /**
     * SAFE вариант: берём top-1 по createdAt.
     * Даже если в БД временно есть дубли (до миграции), метод не упадёт на multiple rows.
     */
    @EntityGraph(attributePaths = {"role"})
    Optional<UserEntity> findTopByTelegramUserIdOrderByCreatedAtDesc(Long telegramUserId);

    /** Locks all normalized matches so concurrent logins cannot steal a placeholder. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select u from UserEntity u join fetch u.role
            where lower(trim(leading '@' from trim(u.nickname))) = :nickname
            order by u.id
            """)
    List<UserEntity> findByNormalizedNicknameForUpdate(@Param("nickname") String nickname);

    @Query("""
        select r.code
        from UserEntity u
        join u.role r
        where u.id = :userId
          and u.status <> com.round13.backend.domain.UserStatus.DELETED
    """)
    Optional<String> findRoleCode(UUID userId);

}
