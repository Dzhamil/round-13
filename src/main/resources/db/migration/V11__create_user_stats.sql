-- Статистика пользователей (для раздела "Статистика" и рейтинга)

CREATE TABLE user_stats (
                            user_id          UUID PRIMARY KEY,
                            fights_count     INT NOT NULL DEFAULT 0,
                            wins_count       INT NOT NULL DEFAULT 0,
                            defeats_count    INT NOT NULL DEFAULT 0,
                            knockouts_count  INT NOT NULL DEFAULT 0,
                            knockdowns_count INT NOT NULL DEFAULT 0,

                            created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
                            updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

                            CONSTRAINT fk_user_stats_user
                                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

                            CONSTRAINT chk_user_stats_non_negative
                                CHECK (
                                    fights_count >= 0
                                        AND wins_count >= 0
                                        AND defeats_count >= 0
                                        AND knockouts_count >= 0
                                        AND knockdowns_count >= 0
                                    )
);

CREATE INDEX idx_user_stats_wins ON user_stats (wins_count);
CREATE INDEX idx_user_stats_fights ON user_stats (fights_count);
