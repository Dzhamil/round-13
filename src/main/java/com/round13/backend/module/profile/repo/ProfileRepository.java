// src/main/java/com/round13/backend/module/profile/repo/ProfileRepository.java
package com.round13.backend.module.profile.repo;

import com.round13.backend.domain.ProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Репозиторий для работы с {@link ProfileEntity}.
 * Предоставляет операции чтения и сохранения профилей пользователей.
 * Профиль связан с пользователем по {@code userId}.
 */
public interface ProfileRepository extends JpaRepository<ProfileEntity, UUID> {

    /**
     * Находит профиль по идентификатору пользователя.
     *
     * @param userId идентификатор пользователя
     * @return {@link Optional} с профилем, если найден
     */
    Optional<ProfileEntity> findByUserId(UUID userId);

    /**
     * Находит профили по списку идентификаторов пользователей.
     *
     * @param userIds список идентификаторов пользователей
     * @return список найденных профилей (может быть пустым)
     */
    List<ProfileEntity> findByUserIdIn(List<UUID> userIds);
}
