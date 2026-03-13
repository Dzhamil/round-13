CREATE TABLE training_balance_events (
    id UUID PRIMARY KEY,
    trainer_id UUID NOT NULL,
    student_id UUID NOT NULL,
    delta INT NOT NULL,
    balance_after INT NOT NULL,
    event_type VARCHAR(32) NOT NULL,
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_training_balance_events_trainer
        FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_training_balance_events_student
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_training_balance_events_created_by
        FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT chk_training_balance_events_delta_non_zero
        CHECK (delta <> 0),

    CONSTRAINT chk_training_balance_events_balance_after_non_negative
        CHECK (balance_after >= 0)
);

CREATE INDEX idx_training_balance_events_trainer_created_at
    ON training_balance_events (trainer_id, created_at DESC);

CREATE INDEX idx_training_balance_events_student_created_at
    ON training_balance_events (student_id, created_at DESC);
