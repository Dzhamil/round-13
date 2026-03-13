ALTER TABLE training_participants
    ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'BOOKED',
    ADD COLUMN cancel_requested_at TIMESTAMPTZ,
    ADD COLUMN cancel_confirmed_at TIMESTAMPTZ,
    ADD COLUMN cancel_confirmed_by_user_id UUID,
    ADD COLUMN charged_at TIMESTAMPTZ,
    ADD COLUMN attended_at TIMESTAMPTZ;

ALTER TABLE training_participants
    ADD CONSTRAINT fk_training_participants_cancel_confirmed_by
        FOREIGN KEY (cancel_confirmed_by_user_id) REFERENCES users(id);

CREATE INDEX idx_training_participants_status
    ON training_participants (status);
