-- Local-only deterministic QA fixtures for the Playwright critical flow harness.
-- Run only against a disposable local database after Flyway migrations.

BEGIN;

DELETE FROM shop_order_items WHERE order_id IN (
    SELECT id FROM shop_orders WHERE user_id IN (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003'
    )
);
DELETE FROM shop_orders WHERE user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
);
DELETE FROM training_participants WHERE user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
);
DELETE FROM training_sessions WHERE id IN (
    '50000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000003',
    '50000000-0000-0000-0000-000000000004',
    '50000000-0000-0000-0000-000000000005',
    '50000000-0000-0000-0000-000000000006',
    '50000000-0000-0000-0000-000000000007'
);
DELETE FROM club_event_participants WHERE user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
);
DELETE FROM club_events WHERE id = '40000000-0000-0000-0000-000000000001';
DELETE FROM user_trainer_links WHERE trainer_id = '00000000-0000-0000-0000-000000000002'
   OR student_id = '00000000-0000-0000-0000-000000000003';
DELETE FROM user_entitlements WHERE user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
);
DELETE FROM shop_products WHERE code IN ('r13-tshirt-black', 'group-8', 'personal-ivan-4');
DELETE FROM shop_categories WHERE id = '30000000-0000-0000-0000-000000000001';
DELETE FROM user_stats WHERE user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
);
DELETE FROM profiles WHERE user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
);
DELETE FROM users WHERE id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
);
DELETE FROM admin_accounts WHERE login = 'qa-admin';

WITH role_ids AS (
    SELECT
        (SELECT id FROM roles WHERE code = 'ADMIN') AS admin_role_id,
        (SELECT id FROM roles WHERE code = 'COACH') AS coach_role_id,
        (SELECT id FROM roles WHERE code = 'ATHLETE') AS athlete_role_id
)
INSERT INTO users (id, phone, nickname, password_hash, role_id, status, telegram_user_id, phone_verified_by_staff)
SELECT '00000000-0000-0000-0000-000000000001', '+79990000001', 'qa_admin', 'local-only-password-hash', admin_role_id, 'ACTIVE', 900001, true FROM role_ids
UNION ALL
SELECT '00000000-0000-0000-0000-000000000002', '+79990000002', 'coach_ivan', 'local-only-password-hash', coach_role_id, 'ACTIVE', 900002, true FROM role_ids
UNION ALL
SELECT '00000000-0000-0000-0000-000000000003', '+79990000003', 'athlete_katya', 'local-only-password-hash', athlete_role_id, 'ACTIVE', 900003, true FROM role_ids;

INSERT INTO profiles (id, user_id, full_name, birth_date, avatar_url, debut_date, clan, gender, profile_completed, about_me)
VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'QA Admin', '1990-01-01', 'https://static.round13.local/qa-admin.png', '2024-01-01', 'Round13 QA', 'MALE', true, 'Локальный QA администратор'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Иван Тренер', '1988-02-02', 'https://static.round13.local/coach-ivan.png', '2024-01-01', 'Round13 QA', 'MALE', true, 'Локальный QA тренер'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Катя Атлет', '1995-03-03', 'https://static.round13.local/athlete-katya.png', '2024-01-01', 'Round13 QA', 'FEMALE', true, 'Локальный QA атлет');

INSERT INTO user_stats (
    user_id,
    fights_count,
    wins_count,
    defeats_count,
    knockouts_count,
    knockdowns_count,
    trainings_attended_count,
    trainings_missed_count,
    points,
    status_label
)
VALUES
    ('00000000-0000-0000-0000-000000000001', 1, 1, 0, 0, 0, 1, 0, 10, 'QA'),
    ('00000000-0000-0000-0000-000000000002', 2, 2, 0, 0, 0, 10, 0, 20, 'QA'),
    ('00000000-0000-0000-0000-000000000003', 3, 2, 1, 0, 0, 5, 0, 30, 'QA');

INSERT INTO admin_accounts (id, login, password_hash, is_active)
VALUES ('20000000-0000-0000-0000-000000000001', 'qa-admin', :'qa_panel_password_hash', true);

INSERT INTO user_trainer_links (id, trainer_id, student_id, remaining_trainings)
VALUES (
    '21000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    8
);

INSERT INTO shop_categories (id, title, description, type, is_active)
VALUES (
    '30000000-0000-0000-0000-000000000001',
    'Экипировка',
    'Локальная QA категория для регрессионных тестов',
    'MERCH',
    true
);

INSERT INTO shop_products (
    id,
    code,
    title,
    description,
    category_id,
    price_amount,
    currency,
    is_active,
    sort_order,
    entitlement_type,
    entitlement_quantity,
    trainer_id
)
VALUES
    ('31000000-0000-0000-0000-000000000001', 'r13-tshirt-black', 'Футболка Round13', 'Черная клубная футболка', '30000000-0000-0000-0000-000000000001', 250000, 'RUB', true, 10, null, null, null),
    ('31000000-0000-0000-0000-000000000002', 'group-8', '8 групповых тренировок', 'Пакет групповых тренировок', '30000000-0000-0000-0000-000000000001', 800000, 'RUB', true, 20, 'GROUP_TRAININGS', 8, null),
    ('31000000-0000-0000-0000-000000000003', 'personal-ivan-4', '4 персональные с Иваном', 'Пакет персональных тренировок', '30000000-0000-0000-0000-000000000001', 1200000, 'RUB', true, 30, 'PERSONAL_TRAININGS', 4, '00000000-0000-0000-0000-000000000002');

INSERT INTO club_events (
    id,
    title,
    description,
    type,
    starts_at,
    ends_at,
    location,
    created_by_user_id,
    trainer_user_id
)
VALUES (
    '40000000-0000-0000-0000-000000000001',
    'Открытая тренировка для новичков',
    'Вводное занятие для новых участников клуба',
    'OPEN_TRAINING',
    '2026-05-20T18:00:00+03:00',
    '2026-05-20T19:00:00+03:00',
    'Зал Round13',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002'
);

INSERT INTO training_sessions (
    id,
    title,
    description,
    type,
    start_time,
    duration_minutes,
    capacity,
    location,
    coach_user_id
)
VALUES
    ('50000000-0000-0000-0000-000000000001', 'Персональная техника', 'QA персональная тренировка', 'PERSONAL', '2026-05-20T12:00:00+03:00', 60, 1, 'Зал Round13', '00000000-0000-0000-0000-000000000002'),
    ('50000000-0000-0000-0000-000000000002', 'Групповая выносливость', 'QA групповая тренировка', 'GROUP', '2026-05-20T14:00:00+03:00', 60, 12, 'Зал Round13', '00000000-0000-0000-0000-000000000002'),
    ('50000000-0000-0000-0000-000000000003', 'Персональная отмена ожидает подтверждения', 'QA запрос отмены для проверки статуса', 'PERSONAL', '2026-05-20T16:00:00+03:00', 60, 1, 'Зал Round13', '00000000-0000-0000-0000-000000000002'),
    ('50000000-0000-0000-0000-000000000004', 'Персональная работа на лапах', 'QA прошедшая персональная тренировка', 'PERSONAL', '2026-05-19T12:00:00+03:00', 60, 1, 'Зал Round13', '00000000-0000-0000-0000-000000000002'),
    ('50000000-0000-0000-0000-000000000005', 'Групповая техника защиты', 'QA прошедшая групповая тренировка', 'GROUP', '2026-05-19T14:00:00+03:00', 60, 12, 'Зал Round13', '00000000-0000-0000-0000-000000000002'),
    ('50000000-0000-0000-0000-000000000006', 'Персональная отменена тренером', 'QA отрицательный контроль отмены тренером', 'PERSONAL', '2026-05-20T18:00:00+03:00', 60, 1, 'Зал Round13', '00000000-0000-0000-0000-000000000002'),
    ('50000000-0000-0000-0000-000000000007', 'Персональная неявка QA', 'QA отрицательный контроль неявки', 'PERSONAL', '2026-05-19T18:00:00+03:00', 60, 1, 'Зал Round13', '00000000-0000-0000-0000-000000000002');

INSERT INTO training_participants (
    id,
    session_id,
    user_id,
    status,
    cancel_requested_at,
    cancel_confirmed_at,
    cancel_confirmed_by_user_id,
    charged_at,
    attended_at
)
VALUES
    ('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'BOOKED', null, null, null, null, null),
    ('51000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'BOOKED', null, null, null, null, null),
    ('51000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'CANCEL_REQUESTED', '2026-05-20T09:00:00+03:00', null, null, null, null),
    ('51000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'ATTENDED', null, null, null, null, '2026-05-19T13:00:00+03:00'),
    ('51000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'ATTENDED', null, null, null, null, '2026-05-19T15:00:00+03:00'),
    ('51000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'CANCELLED_BY_TRAINER', null, '2026-05-20T10:00:00+03:00', '00000000-0000-0000-0000-000000000002', null, null),
    ('51000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 'NO_SHOW', null, null, null, '2026-05-19T19:00:00+03:00', null);

COMMIT;
