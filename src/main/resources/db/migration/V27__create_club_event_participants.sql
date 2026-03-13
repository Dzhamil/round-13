CREATE TABLE club_event_participants (
    id         UUID PRIMARY KEY,
    event_id   UUID NOT NULL,
    user_id    UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_club_event_participants_event
        FOREIGN KEY (event_id) REFERENCES club_events(id) ON DELETE CASCADE,
    CONSTRAINT fk_club_event_participants_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_club_event_participants_event_user
        UNIQUE (event_id, user_id)
);

CREATE INDEX idx_club_event_participants_event_id ON club_event_participants (event_id);
CREATE INDEX idx_club_event_participants_user_id ON club_event_participants (user_id);
