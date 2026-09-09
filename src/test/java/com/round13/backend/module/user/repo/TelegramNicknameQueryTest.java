package com.round13.backend.module.user.repo;

import com.round13.backend.domain.RoleEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatus;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Executes the actual HQL against a database, including the pessimistic lock and normalization. */
class TelegramNicknameQueryTest {
    @Test
    void normalizedLookupLocksAndReturnsAllMatchesIncludingUnavailableAccounts() throws Exception {
        try (SessionFactory factory = new Configuration()
                .addAnnotatedClass(UserEntity.class)
                .addAnnotatedClass(RoleEntity.class)
                .setProperty("hibernate.connection.driver_class", "org.h2.Driver")
                .setProperty("hibernate.connection.url", "jdbc:h2:mem:telegram-nickname;MODE=PostgreSQL")
                .setProperty("hibernate.hbm2ddl.auto", "create-drop")
                .buildSessionFactory();
             Session session = factory.openSession()) {
            session.beginTransaction();
            RoleEntity role = new RoleEntity();
            role.setCode("ATHLETE");
            session.persist(role);
            UserEntity placeholder = user(role, " @MiXeD_Name ", null, UserStatus.ACTIVE);
            UserEntity linked = user(role, "mixed_name", 99L, UserStatus.ACTIVE);
            UserEntity blocked = user(role, "@MIXED_NAME", null, UserStatus.BLOCKED);
            UserEntity deleted = user(role, "Mixed_Name", null, UserStatus.DELETED);
            for (UserEntity user : List.of(placeholder, linked, blocked, deleted,
                    user(role, "other", null, UserStatus.ACTIVE), user(role, null, null, UserStatus.ACTIVE))) {
                session.persist(user);
            }
            session.flush();
            session.clear();

            String hql = UserRepository.class.getMethod("findByNormalizedNicknameForUpdate", String.class)
                    .getAnnotation(Query.class).value();
            List<UserEntity> matches = session.createQuery(hql, UserEntity.class)
                    .setParameter("nickname", "mixed_name")
                    .setLockMode(LockModeType.PESSIMISTIC_WRITE)
                    .getResultList();

            assertThat(matches).extracting(UserEntity::getId)
                    .containsExactlyInAnyOrder(placeholder.getId(), linked.getId(), blocked.getId(), deleted.getId());
            assertThat(matches).allSatisfy(user -> assertThat(user.getRole().getCode()).isEqualTo("ATHLETE"));
            session.getTransaction().rollback();
        }
    }

    private UserEntity user(RoleEntity role, String nickname, Long telegramId, UserStatus status) {
        UserEntity user = new UserEntity();
        user.setRole(role);
        user.setNickname(nickname);
        user.setTelegramUserId(telegramId);
        user.setStatus(status);
        return user;
    }
}
