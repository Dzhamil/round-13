CREATE TABLE club_events (
    id                 UUID PRIMARY KEY,
    title              VARCHAR(256) NOT NULL,
    description        TEXT,
    type               VARCHAR(32) NOT NULL,
    starts_at          TIMESTAMPTZ NOT NULL,
    ends_at            TIMESTAMPTZ NOT NULL,
    location           VARCHAR(256),
    created_by_user_id UUID NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_club_events_created_by
        FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE INDEX idx_club_events_starts_at ON club_events (starts_at);
CREATE INDEX idx_club_events_type ON club_events (type);
