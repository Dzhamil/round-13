// src/main/java/com/round13/backend/module/user/repo/UserRepository.java
package com.round13.backend.module.user.repo;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.user.dto.UserProfileBundle;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    /**
     * Метод оставлен временно для совместимости на время поэтапной чистки.
     */
    @Query("""
            select u
            from UserEntity u
            join fetch u.role r
            where u.phone = :phone
            """)
    Optional<UserEntity> findByPhoneWithRole(@Param("phone") String phone);

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
     * Возвращает пользователя по telegramUserId вместе с ролью.
     * Используется для авторизации через Telegram WebApp.
     */
    @Query("""
            select u
            from UserEntity u
            join fetch u.role r
            where u.telegramUserId = :telegramUserId
            """)
    Optional<UserEntity> findByTelegramUserIdWithRole(@Param("telegramUserId") Long telegramUserId);

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
            """)
    Optional<UserProfileBundle> findUserProfileBundle(@Param("id") UUID id);

    /**
     * SAFE вариант: берём top-1 по createdAt.
     * Даже если в БД временно есть дубли (до миграции), метод не упадёт на multiple rows.
     */
    @EntityGraph(attributePaths = {"role"})
    Optional<UserEntity> findTopByTelegramUserIdOrderByCreatedAtDesc(Long telegramUserId);

    @Query("""
        select r.code
        from UserEntity u
        join u.role r
        where u.id = :userId
    """)
    Optional<String> findRoleCode(UUID userId);

}
