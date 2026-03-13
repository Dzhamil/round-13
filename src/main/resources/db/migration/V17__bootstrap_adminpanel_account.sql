INSERT INTO admin_accounts (login, password_hash, is_active)
SELECT
    '${bootstrap_panel_admin_login}',
    '${bootstrap_panel_admin_password_hash}',
    TRUE
    WHERE
    '${bootstrap_panel_admin_login}' <> ''
    AND '${bootstrap_panel_admin_password_hash}' <> ''
ON CONFLICT (login) DO NOTHING;
