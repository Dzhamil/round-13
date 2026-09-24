package com.round13.backend.module.training.migration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import java.sql.DriverManager;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@EnabledIfEnvironmentVariable(named = "ROUND13_MIGRATION_TEST_URL", matches = ".+")
class TrainingAttendanceMigrationTest {
    @Test
    void removesOnlyLegacyColumnsWithoutOverwritingAttendanceOrSheetPayment() throws Exception {
        String url = System.getenv("ROUND13_MIGRATION_TEST_URL");
        String schema = "attendance_cleanup_" + UUID.randomUUID().toString().replace("-", "");
        try (var connection = DriverManager.getConnection(url, "round13_test", "round13_test");
             var sql = connection.createStatement()) {
            try {
                var configuration = Flyway.configure().dataSource(url, "round13_test", "round13_test")
                        .schemas(schema).defaultSchema(schema).locations("classpath:db/migration")
                        .placeholders(Map.of("bootstrap_admin_phone", "", "bootstrap_admin_nickname", "",
                                "bootstrap_admin_password_hash", "", "bootstrap_panel_admin_login", "",
                                "bootstrap_panel_admin_password_hash", ""));
                configuration.target("54").load().migrate();
                sql.execute("SET search_path TO " + schema);
                sql.execute("""
                        INSERT INTO users (id, nickname, role_id, status)
                        VALUES ('00000000-0000-0000-0000-000000000001', 'student',
                                (SELECT id FROM roles WHERE code = 'ATHLETE'), 'ACTIVE');
                        INSERT INTO training_sessions (id, title, type, start_time, duration_minutes, schedule2_enabled)
                        SELECT md5('session-' || n)::uuid, 'training', 'GROUP', now(), 60, true
                        FROM generate_series(1, 7) n;
                        INSERT INTO training_participants (id, session_id, user_id, status, attendance_status,
                                attendance_version, sheet_import_paid, attendance_marked_at,
                                cancel_requested_at, cancel_confirmed_at, cancel_confirmed_by_user_id,
                                charged_at, attended_at)
                        SELECT md5('participant-' || n)::uuid, md5('session-' || n)::uuid,
                               '00000000-0000-0000-0000-000000000001',
                               (ARRAY['BOOKED', 'CANCEL_REQUESTED', 'CANCELLED_FREE', 'CANCELLED_LATE',
                                      'CANCELLED_BY_TRAINER', 'ATTENDED', 'NO_SHOW'])[n],
                               CASE WHEN n % 2 = 0 THEN 'ABSENT' ELSE 'PRESENT' END, 7, true, now(),
                               now(), now(), '00000000-0000-0000-0000-000000000001', now(), now()
                        FROM generate_series(1, 7) n;
                        """);
                String before;
                String snapshot = """
                        SELECT jsonb_agg(to_jsonb(p) - ARRAY['status','cancel_requested_at','cancel_confirmed_at',
                          'cancel_confirmed_by_user_id','charged_at','attended_at'] ORDER BY id)::text
                        FROM training_participants p
                        """;
                try (var rows = sql.executeQuery(snapshot)) { rows.next(); before = rows.getString(1); }
                var flyway = configuration.target("latest").load();
                assertThat(flyway.migrate().migrationsExecuted).isEqualTo(1);
                flyway.validate();
                try (var rows = sql.executeQuery(snapshot)) { rows.next(); assertThat(rows.getString(1)).isEqualTo(before); }
                try (var rows = sql.executeQuery("""
                        SELECT count(*) FROM information_schema.columns WHERE table_schema = current_schema()
                        AND table_name = 'training_participants' AND column_name IN
                        ('status','cancel_requested_at','cancel_confirmed_at','cancel_confirmed_by_user_id','charged_at','attended_at')
                        """)) { rows.next(); assertThat(rows.getInt(1)).isZero(); }
                // The post-migration insert contract needs no legacy status/default.
                sql.execute("""
                        INSERT INTO training_sessions (id, title, type, start_time, duration_minutes, schedule2_enabled)
                        VALUES ('00000000-0000-0000-0000-000000000002', 'new', 'GROUP', now(), 60, true);
                        INSERT INTO training_participants (session_id, user_id, attendance_status)
                        VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'ABSENT');
                        """);
                assertThat(flyway.migrate().migrationsExecuted).isZero();
            } finally {
                sql.execute("DROP SCHEMA IF EXISTS " + schema + " CASCADE");
            }
        }
    }
}
