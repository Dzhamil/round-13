package com.round13.backend.module.adminpanel.repo;

import com.round13.backend.domain.AdminAccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Репозиторий для работы с учетными записями администраторов.
 * Предоставляет стандартные CRUD-операции и дополнительные методы
 * для поиска и проверки существования администратора по логину.
 */
public interface AdminAccountRepository extends JpaRepository<AdminAccountEntity, UUID> {

    /**
     * Возвращает учетную запись администратора по указанному логину.
     *
     * @param login логин администратора
     * @return Optional с найденной сущностью или пустой, если запись не найдена
     */
    Optional<AdminAccountEntity> findByLogin(String login);

}
