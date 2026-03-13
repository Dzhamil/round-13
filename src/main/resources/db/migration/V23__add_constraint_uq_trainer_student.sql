ALTER TABLE user_trainer_links
    ADD CONSTRAINT uq_trainer_student
        UNIQUE (trainer_id, student_id);