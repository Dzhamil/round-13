CREATE TABLE loyalty_scoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(96) NOT NULL,
    source_type VARCHAR(48) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_to TIMESTAMPTZ,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_loyalty_scoring_rules_code_version UNIQUE (code, version),
    CONSTRAINT chk_loyalty_scoring_rules_version_positive CHECK (version > 0)
);

CREATE UNIQUE INDEX uq_loyalty_scoring_rules_active_code
    ON loyalty_scoring_rules (code)
    WHERE enabled = TRUE AND valid_to IS NULL;

CREATE INDEX idx_loyalty_scoring_rules_source_type
    ON loyalty_scoring_rules (source_type);

CREATE TABLE loyalty_rank_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(96) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    min_points INT NOT NULL,
    sort_order INT NOT NULL,
    is_major BOOLEAN NOT NULL DEFAULT TRUE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_loyalty_rank_rules_min_points_non_negative CHECK (min_points >= 0)
);

CREATE INDEX idx_loyalty_rank_rules_enabled_points
    ON loyalty_rank_rules (enabled, min_points, sort_order);

CREATE TABLE loyalty_achievement_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(96) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    description VARCHAR(512),
    kind VARCHAR(48) NOT NULL,
    threshold_points INT,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL,
    CONSTRAINT chk_loyalty_achievement_rules_threshold_non_negative
        CHECK (threshold_points IS NULL OR threshold_points >= 0)
);

CREATE INDEX idx_loyalty_achievement_rules_enabled_kind
    ON loyalty_achievement_rules (enabled, kind, sort_order);

CREATE TABLE loyalty_point_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type VARCHAR(48) NOT NULL,
    points_delta INT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    source_entity_id UUID,
    source_entity_type VARCHAR(64),
    recorded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reason VARCHAR(512) NOT NULL,
    rule_code VARCHAR(96),
    rule_version INT,
    idempotency_key VARCHAR(160) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    correction_of_entry_id UUID REFERENCES loyalty_point_entries(id) ON DELETE RESTRICT,
    revoked_entry_id UUID REFERENCES loyalty_point_entries(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_loyalty_point_entries_idempotency UNIQUE (idempotency_key),
    CONSTRAINT chk_loyalty_point_entries_points_delta_not_zero CHECK (points_delta <> 0)
);

CREATE INDEX idx_loyalty_point_entries_member_event
    ON loyalty_point_entries (member_id, event_date DESC, created_at DESC);

CREATE INDEX idx_loyalty_point_entries_source
    ON loyalty_point_entries (source_type, source_entity_id);

CREATE INDEX idx_loyalty_point_entries_actor
    ON loyalty_point_entries (recorded_by_user_id, recorded_at DESC);

CREATE INDEX idx_loyalty_point_entries_rule
    ON loyalty_point_entries (rule_code);

CREATE INDEX idx_loyalty_point_entries_correction
    ON loyalty_point_entries (correction_of_entry_id);

CREATE INDEX idx_loyalty_point_entries_reversal
    ON loyalty_point_entries (revoked_entry_id);

CREATE TABLE loyalty_point_totals (
    member_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_points INT NOT NULL DEFAULT 0,
    positive_points INT NOT NULL DEFAULT 0,
    negative_points INT NOT NULL DEFAULT 0,
    current_rank_code VARCHAR(96),
    current_achievement_code VARCHAR(96),
    next_rank_code VARCHAR(96),
    next_rank_points INT,
    points_to_next_rank INT,
    recalculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_loyalty_point_totals_positive_non_negative CHECK (positive_points >= 0),
    CONSTRAINT chk_loyalty_point_totals_negative_non_positive CHECK (negative_points <= 0)
);

CREATE INDEX idx_loyalty_point_totals_total_points
    ON loyalty_point_totals (total_points DESC);

INSERT INTO loyalty_scoring_rules (code, source_type, version, config)
VALUES
    ('training.visit.attended', 'TRAINING_VISIT', 1, '{"points": 2}'::jsonb),
    ('training.weekly.streak_3', 'TRAINING_STREAK_BONUS', 1, '{"period": "WEEK", "visits": 3, "points": 5}'::jsonb),
    ('training.monthly.8_visits', 'TRAINING_MONTHLY_MILESTONE', 1, '{"period": "MONTH", "visits": 8, "points": 10}'::jsonb),
    ('training.monthly.12_visits', 'TRAINING_MONTHLY_MILESTONE', 1, '{"period": "MONTH", "visits": 12, "points": 25}'::jsonb),
    ('club.event.attendance', 'CLUB_EVENT_ATTENDANCE', 1, '{"points": 10, "awardMode": "MANUAL_CONFIRMED"}'::jsonb),
    ('member.recruitment', 'RECRUITMENT', 1, '{"points": 50, "awardMode": "MANUAL"}'::jsonb),
    ('member.initiation', 'INITIATION', 1, '{"points": 50, "awardMode": "MANUAL"}'::jsonb),
    ('fitness.norm.improvement', 'FITNESS_NORM_IMPROVEMENT', 1, '{"tiers": [{"min": 0, "max": 20, "points": 2}, {"min": 21, "max": 30, "points": 4}, {"min": 31, "points": 6}]}'::jsonb),
    ('monthly.complex.placement', 'MONTHLY_COMPLEX_PLACEMENT', 1, '{"minPlace": 1, "maxPlace": 10, "firstPlacePoints": 100, "step": -10}'::jsonb),
    ('clan.war.placement', 'CLAN_WAR_PLACEMENT', 1, '{"minPlace": 1, "maxPlace": 10, "firstPlacePoints": 100, "step": -10, "needsProductConfirmation": true}'::jsonb),
    ('physical.prep.championship', 'PHYSICAL_PREPARATION_CHAMPIONSHIP', 1, '{"places": {"1": 500, "2": 300, "3": 100}}'::jsonb),
    ('boxing.match.result', 'BOXING_MATCH', 1, '{"rounds": {"3": {"WIN": 100, "LOSS": 50}, "4": {"WIN": 200, "LOSS": 100}, "6": {"WIN": 500, "LOSS": 250}}}'::jsonb);

INSERT INTO loyalty_rank_rules (code, name, min_points, sort_order, is_major)
VALUES
    ('rookie', 'Новичок', 0, 10, TRUE),
    ('steady', 'Уверенный участник', 100, 20, TRUE),
    ('active', 'Актив клуба', 250, 30, TRUE),
    ('contender', 'Претендент', 500, 40, TRUE);

INSERT INTO loyalty_achievement_rules (code, name, description, kind, threshold_points, sort_order)
VALUES
    ('points_50', '50 очков', 'Промежуточная отметка прогресса', 'POINTS_THRESHOLD', 50, 10),
    ('points_150', '150 очков', 'Промежуточная отметка прогресса', 'POINTS_THRESHOLD', 150, 20),
    ('points_350', '350 очков', 'Промежуточная отметка прогресса', 'POINTS_THRESHOLD', 350, 30);
