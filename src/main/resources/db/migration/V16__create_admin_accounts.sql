CREATE TABLE admin_accounts
(
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    login         VARCHAR(64)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_accounts_login ON admin_accounts (login);
CREATE INDEX idx_admin_accounts_active ON admin_accounts (is_active);
