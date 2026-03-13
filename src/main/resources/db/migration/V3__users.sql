CREATE TABLE users
(
    id               uuid PRIMARY KEY      DEFAULT gen_random_uuid(),
    phone            VARCHAR(32) UNIQUE,
    nickname         VARCHAR(64) UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,
    role_id          BIGINT       NOT NULL REFERENCES roles (id) ON DELETE RESTRICT,
    status           VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    telegram_user_id BIGINT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role_id ON users (role_id);
CREATE INDEX idx_users_telegram_user_id ON users (telegram_user_id);
CREATE INDEX idx_users_status ON users (status);
