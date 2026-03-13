CREATE TABLE refresh_tokens
(
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash   VARCHAR(256) NOT NULL UNIQUE,
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked      BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);
CREATE INDEX idx_refresh_tokens_revoked ON refresh_tokens (revoked);
