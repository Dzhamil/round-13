CREATE TABLE profiles
(
    id                UUID PRIMARY KEY,
    user_id           UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    full_name         VARCHAR(256),
    birth_date        DATE,
    avatar_url        TEXT,
    debut_date        DATE,
    clan              VARCHAR(128),
    profile_completed BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_profiles_user_id UNIQUE (user_id)
);
