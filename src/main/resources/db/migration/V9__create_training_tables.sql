-- Расписание тренировок / афиша: базовые таблицы

CREATE TABLE training_sessions (
                                   id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   title            VARCHAR(256) NOT NULL,
                                   description      TEXT,
                                   type             VARCHAR(16)  NOT NULL,          -- GROUP/PERSONAL/OPEN
                                   start_time       TIMESTAMPTZ  NOT NULL,
                                   duration_minutes INT          NOT NULL,
                                   capacity         INT,                             -- NULL = без лимита (для OPEN)
                                   location         VARCHAR(256),
                                   coach_user_id    UUID,                            -- тренер/организатор (user_id)

                                   created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
                                   updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),

                                   CONSTRAINT fk_training_sessions_coach
                                       FOREIGN KEY (coach_user_id) REFERENCES users(id)
);

CREATE INDEX idx_training_sessions_start_time ON training_sessions (start_time);
CREATE INDEX idx_training_sessions_type       ON training_sessions (type);
CREATE INDEX idx_training_sessions_coach      ON training_sessions (coach_user_id);

-- Участники тренировки (запись/отказ)
CREATE TABLE training_participants (
                                       id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                       session_id  UUID NOT NULL,
                                       user_id     UUID NOT NULL,
                                       created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

                                       CONSTRAINT fk_training_participants_session
                                           FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,

                                       CONSTRAINT fk_training_participants_user
                                           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

                                       CONSTRAINT uq_training_participants_session_user
                                           UNIQUE (session_id, user_id)
);

CREATE INDEX idx_training_participants_session ON training_participants (session_id);
CREATE INDEX idx_training_participants_user    ON training_participants (user_id);
