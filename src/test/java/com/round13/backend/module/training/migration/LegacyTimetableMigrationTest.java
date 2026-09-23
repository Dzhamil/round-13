package com.round13.backend.module.training.migration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/** Runs only against an explicitly supplied disposable PostgreSQL database. */
@EnabledIfEnvironmentVariable(named = "ROUND13_MIGRATION_TEST_URL", matches = ".+")
class LegacyTimetableMigrationTest {
    @Test
    void deletesAllLegacySessionsAndParticipantsWhilePreservingSchedule2AndClubEvents() throws Exception {
        String url = System.getenv("ROUND13_MIGRATION_TEST_URL");
        String schema = "legacy_removal_" + java.util.UUID.randomUUID().toString().replace("-", "");
        try (Connection connection = DriverManager.getConnection(url, "round13_test", "round13_test");
             Statement sql = connection.createStatement()) {
            try {
                var configuration = Flyway.configure().dataSource(url, "round13_test", "round13_test")
                        .schemas(schema).defaultSchema(schema)
                        .locations("classpath:db/migration")
                        .placeholders(Map.of("bootstrap_admin_phone", "", "bootstrap_admin_nickname", "",
                                "bootstrap_admin_password_hash", "", "bootstrap_panel_admin_login", "",
                                "bootstrap_panel_admin_password_hash", ""));
                configuration.target("53").load().migrate();
                sql.execute("SET search_path TO " + schema);
                sql.execute("""
                        INSERT INTO users (id, nickname, role_id, status)
                        VALUES ('00000000-0000-0000-0000-000000000001', 'migration-coach',
                                (SELECT id FROM roles WHERE code = 'COACH'), 'ACTIVE'),
                               ('00000000-0000-0000-0000-000000000002', 'migration-student',
                                (SELECT id FROM roles WHERE code = 'ATHLETE'), 'ACTIVE');
                        INSERT INTO training_sessions (id, title, type, start_time, duration_minutes, coach_user_id)
                        SELECT md5('legacy-session-' || n)::uuid, 'legacy-' || n,
                               CASE n % 3 WHEN 0 THEN 'PERSONAL' WHEN 1 THEN 'GROUP' ELSE 'OPEN' END,
                               now() + (n - 4) * interval '1 day', 60,
                               CASE WHEN n = 7 THEN NULL ELSE '00000000-0000-0000-0000-000000000001'::uuid END
                        FROM generate_series(1, 8) n;
                        INSERT INTO training_participants (id, session_id, user_id, status)
                        SELECT md5('legacy-participant-' || n)::uuid, md5('legacy-session-' || n)::uuid,
                               '00000000-0000-0000-0000-000000000002',
                               (ARRAY['BOOKED', 'CANCEL_REQUESTED', 'CANCELLED_FREE', 'CANCELLED_LATE',
                                      'CANCELLED_BY_TRAINER', 'ATTENDED', 'NO_SHOW'])[n]
                        FROM generate_series(1, 7) n;
                        INSERT INTO training_sessions (id, title, type, start_time, duration_minutes, coach_user_id,
                                                       schedule2_enabled, sheet_import_spreadsheet_id,
                                                       sheet_import_training_id, sheet_import_date, sheet_import_active)
                        SELECT md5('schedule2-session-' || n)::uuid, 'schedule2-' || n, 'GROUP', now(), 60,
                               '00000000-0000-0000-0000-000000000001', true,
                               CASE WHEN n > 1 THEN 'test-sheet' END,
                               CASE WHEN n > 1 THEN n END,
                               CASE WHEN n > 1 THEN timestamp '2026-09-23 12:00:00' END, n <> 3
                        FROM generate_series(1, 3) n;
                        INSERT INTO training_participants (id, session_id, user_id, attendance_status, sheet_import_paid)
                        SELECT md5('schedule2-participant-' || n)::uuid, md5('schedule2-session-' || n)::uuid,
                               '00000000-0000-0000-0000-000000000002', 'PRESENT', true
                        FROM generate_series(1, 3) n;
                        INSERT INTO club_events (id, title, type, starts_at, ends_at, created_by_user_id)
                        VALUES ('00000000-0000-0000-0000-000000000003', 'club-event', 'CLUB_EVENT', now(), now() + interval '1 hour',
                                '00000000-0000-0000-0000-000000000001');
                        INSERT INTO club_event_participants (id, event_id, user_id)
                        VALUES ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003',
                                '00000000-0000-0000-0000-000000000002');
                        """);
                String sessionsBefore = snapshot(sql, "training_sessions", "schedule2_enabled");
                String participantsBefore = snapshot(sql, "training_participants", "attendance_status = 'PRESENT'");
                assertThat(count(sql, "training_sessions", "NOT schedule2_enabled")).isEqualTo(8);
                assertThat(count(sql, "training_participants", "true")).isEqualTo(10);

                var flyway = configuration.target("latest").load();
                assertThat(flyway.migrate().migrationsExecuted).isEqualTo(1);
                flyway.validate();
                assertThat(count(sql, "training_sessions", "NOT schedule2_enabled")).isZero();
                assertThat(count(sql, "training_participants", "true")).isEqualTo(3);
                assertThat(snapshot(sql, "training_sessions", "true")).isEqualTo(sessionsBefore);
                assertThat(snapshot(sql, "training_participants", "true")).isEqualTo(participantsBefore);
                assertThat(count(sql, "club_events", "true")).isEqualTo(1);
                assertThat(count(sql, "club_event_participants", "true")).isEqualTo(1);
                assertThat(count(sql, "users", "true")).isEqualTo(2);
                assertThat(flyway.migrate().migrationsExecuted).isZero();
            } finally {
                sql.execute("DROP SCHEMA IF EXISTS " + schema + " CASCADE");
            }
        }
    }

    private long count(Statement sql, String table, String condition) throws Exception {
        try (ResultSet result = sql.executeQuery("SELECT count(*) FROM " + table + " WHERE " + condition)) {
            result.next();
            return result.getLong(1);
        }
    }

    private String snapshot(Statement sql, String table, String condition) throws Exception {
        try (ResultSet result = sql.executeQuery("SELECT jsonb_agg(to_jsonb(t) ORDER BY id)::text FROM "
                + table + " t WHERE " + condition)) {
            result.next();
            return result.getString(1);
        }
    }
}
