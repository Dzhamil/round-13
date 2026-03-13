INSERT INTO users (phone, nickname, password_hash, role_id, status)
SELECT
    '${bootstrap_admin_phone}',
    '${bootstrap_admin_nickname}',
    '${bootstrap_admin_password_hash}',
    (SELECT id FROM roles WHERE code = 'ADMIN'),
    'ACTIVE'
    WHERE
  '${bootstrap_admin_phone}' <> ''
  AND '${bootstrap_admin_password_hash}' <> ''
ON CONFLICT (phone) DO NOTHING;

INSERT INTO profiles (user_id, profile_completed)
SELECT u.id, false
FROM users u
WHERE u.phone = '${bootstrap_admin_phone}'
  AND '${bootstrap_admin_phone}' <> ''
    ON CONFLICT (user_id) DO NOTHING;
