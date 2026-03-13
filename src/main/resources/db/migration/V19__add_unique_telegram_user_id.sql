-- 1) Удаляем дубли по telegram_user_id, если они уже успели появиться.
-- Оставляем самого нового (created_at DESC), остальные удаляем.
WITH ranked AS (
    SELECT
        id,
        telegram_user_id,
        ROW_NUMBER() OVER (PARTITION BY telegram_user_id ORDER BY created_at DESC) AS rn
    FROM users
    WHERE telegram_user_id IS NOT NULL
)
DELETE FROM users u
    USING ranked r
WHERE u.id = r.id
  AND r.rn > 1;

-- 2) Добавляем уникальность на telegram_user_id
ALTER TABLE users
    ADD CONSTRAINT uk_users_telegram_user_id UNIQUE (telegram_user_id);
