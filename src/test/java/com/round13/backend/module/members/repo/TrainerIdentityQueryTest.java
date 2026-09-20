package com.round13.backend.module.members.repo;

import com.round13.backend.domain.*;
import com.round13.backend.module.members.dto.MemberListItemRow;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Query;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.DriverManager;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TrainerIdentityQueryTest {
    @Test
    void coachesQueryUsesIdentityAndExcludesDeletedUsers() throws Exception {
        try (var factory = new Configuration()
                .addAnnotatedClass(UserEntity.class).addAnnotatedClass(RoleEntity.class)
                .addAnnotatedClass(ProfileEntity.class).addAnnotatedClass(UserStatsEntity.class)
                .setProperty("hibernate.connection.driver_class", "org.h2.Driver")
                .setProperty("hibernate.connection.url", "jdbc:h2:mem:trainer-query;MODE=PostgreSQL")
                .setProperty("hibernate.hbm2ddl.auto", "create-drop").buildSessionFactory();
             var session = factory.openSession()) {
            session.beginTransaction();
            for (String code : List.of("ATHLETE", "COACH", "ADMIN")) {
                RoleEntity role = new RoleEntity();
                role.setCode(code);
                session.persist(role);
                UserEntity user = new UserEntity();
                user.setNickname(code);
                user.setRole(role);
                user.setStatus(UserStatus.ACTIVE);
                session.persist(user);
                if (code.equals("ADMIN")) {
                    for (UserStatus status : List.of(UserStatus.ACTIVE, UserStatus.DELETED)) {
                        UserEntity trainer = new UserEntity();
                        trainer.setNickname("admin-trainer-" + status);
                        trainer.setRole(role);
                        trainer.setTrainer(true);
                        trainer.setStatus(status);
                        session.persist(trainer);
                    }
                }
            }
            session.flush();
            session.clear();
            String hql = MembersReadRepository.class.getMethod("findCoaches").getAnnotation(Query.class).value();
            assertThat(session.createQuery(hql, MemberListItemRow.class).getResultList())
                    .extracting(MemberListItemRow::nickname).containsExactlyInAnyOrder("COACH", "admin-trainer-ACTIVE");
            String mirrorQuery = com.round13.backend.module.user.repo.UserRepository.class
                    .getMethod("findTrainerMirrorCandidates").getAnnotation(Query.class).value();
            assertThat(session.createQuery(mirrorQuery, UserEntity.class).getResultList())
                    .extracting(UserEntity::getNickname)
                    .containsExactlyInAnyOrder("COACH", "admin-trainer-ACTIVE", "admin-trainer-DELETED");
            session.getTransaction().rollback();
        }
    }

    @Test
    void migrationBackfillsOnlyCoachesAndDefaultsNewUsersToFalse() throws Exception {
        try (var connection = DriverManager.getConnection("jdbc:h2:mem:trainer-migration;MODE=PostgreSQL");
             var statement = connection.createStatement()) {
            statement.execute("CREATE TABLE roles(id INT PRIMARY KEY, code VARCHAR(20))");
            statement.execute("CREATE TABLE users(id INT PRIMARY KEY, role_id INT)");
            statement.execute("INSERT INTO roles VALUES (1, 'ATHLETE'), (2, 'COACH'), (3, 'ADMIN')");
            statement.execute("INSERT INTO users VALUES (1, 1), (2, 2), (3, 3)");
            statement.execute(Files.readString(Path.of("src/main/resources/db/migration/V48__explicit_trainer_identity.sql")));
            statement.execute("INSERT INTO users(id, role_id) VALUES (4, 3)");
            try (var rows = statement.executeQuery("SELECT trainer FROM users ORDER BY id")) {
                for (boolean expected : List.of(false, true, false, false)) {
                    assertThat(rows.next()).isTrue();
                    assertThat(rows.getBoolean(1)).isEqualTo(expected);
                }
            }
        }
    }
}
