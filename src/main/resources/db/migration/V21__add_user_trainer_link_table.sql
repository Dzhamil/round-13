-- src/main/resources/db/migration/V21__create_user_trainer_links.sql

CREATE TABLE IF NOT EXISTS user_trainer_links (
                                                  id UUID PRIMARY KEY,
                                                  trainer_id UUID NOT NULL,
                                                  student_id UUID NOT NULL,
                                                  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_user_trainer_links_trainer
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_user_trainer_links_student
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT uk_user_trainer_links_pair UNIQUE (trainer_id, student_id)
    );

CREATE INDEX IF NOT EXISTS ix_user_trainer_links_trainer_id
    ON user_trainer_links (trainer_id);

CREATE INDEX IF NOT EXISTS ix_user_trainer_links_student_id
    ON user_trainer_links (student_id);
