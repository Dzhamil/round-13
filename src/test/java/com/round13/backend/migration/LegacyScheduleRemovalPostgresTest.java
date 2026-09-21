package com.round13.backend.migration;

import jakarta.persistence.EntityManagerFactory;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Requires an explicitly supplied disposable PostgreSQL database, never a production datasource. */
@SpringBootTest(properties = {"app.jwt.secret=disposable-test-secret-at-least-32-characters",
        "spring.jpa.hibernate.ddl-auto=validate", "spring.flyway.enabled=true"})
@AutoConfigureMockMvc
@EnabledIfEnvironmentVariable(named = "ROUND13_TEST_POSTGRES_URL", matches = "jdbc:postgresql://(localhost|127\\.0\\.0\\.1):[0-9]+/round13_legacy_removal_test")
class LegacyScheduleRemovalPostgresTest {
    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> System.getenv("ROUND13_TEST_POSTGRES_URL"));
        registry.add("spring.datasource.username", () -> "round13_test");
        registry.add("spring.datasource.password", () -> "disposable_test_only");
    }

    @Autowired JdbcTemplate jdbc;
    @Autowired MockMvc mvc;
    @Autowired EntityManagerFactory entities;
    @Autowired @Qualifier("requestMappingHandlerMapping") RequestMappingHandlerMapping mappings;

    @Test void cleanDatabaseMigratesAndApplicationStartsWithoutLegacyEntities() {
        assertThat(jdbc.queryForObject("select to_regclass('training_sessions')::text", String.class)).isNull();
        assertThat(jdbc.queryForObject("select to_regclass('training_participants')::text", String.class)).isNull();
        assertThat(jdbc.queryForObject("select to_regclass('club_events')::text", String.class)).isEqualTo("club_events");
        assertThat(entities.getMetamodel().getEntities()).noneMatch(e -> e.getName().startsWith("TrainingSession")
                || e.getName().startsWith("TrainingParticipant"));
        assertThat(mappings.getHandlerMethods().keySet().stream().flatMap(m -> m.getPatternValues().stream()))
                .noneMatch(p -> p.startsWith("/api/trainer/schedule") || p.startsWith("/api/trainer/personal-trainings")
                        || p.startsWith("/api/trainer/events") || p.startsWith("/api/account/schedule")
                        || p.startsWith("/api/training-sessions"));
    }

    @Test @WithMockUser(username = "00000000-0000-0000-0000-000000000001", roles = "COACH")
    void retiredEndpointsReturn404AndIndependentScheduleIsEmpty() throws Exception {
        String id = UUID.randomUUID().toString();
        for (String path : new String[]{"/api/trainer/schedule", "/api/account/schedule", "/api/training-sessions"}) {
            mvc.perform(get(path)).andExpect(status().isNotFound());
        }
        for (String path : new String[]{"/api/trainer/personal-trainings", "/api/trainer/events",
                "/api/account/schedule/" + id + "/cancel-request",
                "/api/trainer/schedule/" + id + "/confirm-cancellation",
                "/api/trainer/schedule/" + id + "/mark-attended",
                "/api/trainer/schedule/" + id + "/mark-no-show",
                "/api/trainer/schedule/" + id + "/cancel-by-trainer",
                "/api/training-sessions/" + id + "/join", "/api/training-sessions/" + id + "/cancel"}) {
            mvc.perform(post(path)).andExpect(status().isNotFound());
        }
        mvc.perform(get("/api/schedule2/trainings").param("from", "2026-09-01").param("to", "2026-09-30"))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
        mvc.perform(post("/api/schedule2/trainings")).andExpect(status().isMethodNotAllowed());
        mvc.perform(get("/api/schedule2/trainings/" + id)).andExpect(status().isNotFound());
        mvc.perform(put("/api/schedule2/trainings/" + id + "/attendance")).andExpect(status().isNotFound());
        mvc.perform(get("/api/schedule2/trainings").param("from", "2026-10-01").param("to", "2026-09-30"))
                .andExpect(status().isBadRequest());
    }

    @Test void upgradeDeletesLegacyRowsWithoutCopyingOrRemovingUnrelatedClubEvents() {
        String schema = "legacy_upgrade_" + UUID.randomUUID().toString().replace("-", "");
        var source = new DriverManagerDataSource(System.getenv("ROUND13_TEST_POSTGRES_URL"), "round13_test", "disposable_test_only");
        var placeholders = Map.of("bootstrap_admin_phone", "", "bootstrap_admin_nickname", "",
                "bootstrap_admin_password_hash", "", "bootstrap_panel_admin_login", "", "bootstrap_panel_admin_password_hash", "");
        var upgrade = Flyway.configure().dataSource(source).schemas(schema).defaultSchema(schema)
                .placeholders(placeholders).cleanDisabled(false).load();
        try {
            Flyway.configure().dataSource(source).schemas(schema).defaultSchema(schema)
                    .placeholders(placeholders).target("50").load().migrate();
            var scopedSource = new DriverManagerDataSource(System.getenv("ROUND13_TEST_POSTGRES_URL") + "?currentSchema=" + schema,
                    "round13_test", "disposable_test_only");
            var db = new JdbcTemplate(scopedSource);
            UUID user = UUID.randomUUID(), session = UUID.randomUUID(), legacyEvent = UUID.randomUUID(), event = UUID.randomUUID();
            db.update("insert into users(id,nickname,password_hash,role_id) values (?, 'migration-test', 'unused', (select id from roles limit 1))", user);
            db.update("insert into training_sessions(id,title,type,start_time,duration_minutes,coach_user_id,schedule2_enabled) values (?, 'old', 'GROUP', now(), 60, ?, true)", session, user);
            db.update("insert into training_participants(id,session_id,user_id,status) values (?, ?, ?, 'ATTENDED')", UUID.randomUUID(), session, user);
            db.update("insert into user_stats(user_id,trainings_attended_count,trainings_missed_count,fights_count,points) values (?, 7, 2, 3, 10)", user);
            for (UUID id : new UUID[]{legacyEvent, event}) {
                db.update("insert into club_events(id,title,type,starts_at,ends_at,created_by_user_id) values (?, 'event', ?, now(), now(), ?)",
                        id, id.equals(event) ? "COMPETITION" : "COACH_TRAINING", user);
                db.update("insert into club_event_participants(id,event_id,user_id) values (?, ?, ?)", UUID.randomUUID(), id, user);
            }
            // An unaudited incoming FK must stop the migration, not be cascaded away.
            db.execute("create table dependency_guard (session_id uuid references training_sessions(id))");
            assertThatThrownBy(upgrade::migrate).isInstanceOf(org.flywaydb.core.api.FlywayException.class);
            assertThat(db.queryForObject("select count(*) from training_sessions", Integer.class)).isEqualTo(1);
            assertThat(db.queryForObject("select count(*) from training_participants", Integer.class)).isEqualTo(1);
            db.execute("drop table dependency_guard");
            upgrade.migrate();
            upgrade.validate();
            assertThat(db.queryForObject("select to_regclass('training_sessions')::text", String.class)).isNull();
            assertThat(db.queryForObject("select to_regclass('training_participants')::text", String.class)).isNull();
            assertThat(db.queryForList("select id from club_events", UUID.class)).containsExactly(event);
            assertThat(db.queryForList("select event_id from club_event_participants", UUID.class)).containsExactly(event);
            assertThat(db.queryForObject("select trainings_attended_count + trainings_missed_count from user_stats where user_id=?", Integer.class, user)).isZero();
            assertThat(db.queryForObject("select fights_count from user_stats where user_id=?", Integer.class, user)).isEqualTo(3);
            assertThat(db.queryForObject("select points from user_stats where user_id=?", Integer.class, user)).isEqualTo(3);
            assertThat(db.queryForList("select table_name from information_schema.tables where table_schema=?", String.class, schema))
                    .noneMatch(name -> name.startsWith("schedule2") || name.contains("archive"));
        } finally {
            upgrade.clean();
        }
    }
}
