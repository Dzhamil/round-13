ALTER TABLE user_trainer_links
    ADD COLUMN coach_note TEXT,
    ADD COLUMN coach_note_updated_at TIMESTAMPTZ,
    ADD COLUMN coach_note_updated_by_user_id UUID;

ALTER TABLE user_trainer_links
    ADD CONSTRAINT fk_user_trainer_links_note_updated_by
        FOREIGN KEY (coach_note_updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
