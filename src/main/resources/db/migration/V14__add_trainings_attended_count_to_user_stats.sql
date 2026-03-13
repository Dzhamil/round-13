-- V14__add_trainings_attended_count_to_user_stats.sql
-- Добавляет накопительный счётчик посещённых тренировок в user_stats.

ALTER TABLE user_stats
    ADD COLUMN trainings_attended_count INT NOT NULL DEFAULT 0;

-- Отдельная проверка (не трогаем существующий chk_user_stats_non_negative из V11)
ALTER TABLE user_stats
    ADD CONSTRAINT chk_user_stats_trainings_attended_non_negative
        CHECK (trainings_attended_count >= 0);

CREATE INDEX idx_user_stats_trainings_attended
    ON user_stats (trainings_attended_count);
