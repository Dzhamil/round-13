ALTER TABLE user_trainer_links
    ADD COLUMN remaining_trainings INT NOT NULL DEFAULT 0;

ALTER TABLE user_trainer_links
    ADD CONSTRAINT chk_user_trainer_links_remaining_trainings_non_negative
        CHECK (remaining_trainings >= 0);
