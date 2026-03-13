-- Кеш очков и статуса участника (обновляется раз в сутки)
ALTER TABLE user_stats
    ADD COLUMN points INT NOT NULL DEFAULT 0;

ALTER TABLE user_stats
    ADD COLUMN status_label VARCHAR(64) NOT NULL DEFAULT '—';

CREATE INDEX idx_user_stats_points
    ON user_stats (points);
