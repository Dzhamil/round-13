CREATE TABLE boxer_potential_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    measured_at TIMESTAMPTZ NOT NULL,
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    norm_group VARCHAR(16) NOT NULL,
    norm_set VARCHAR(16) NOT NULL,
    age_at_measurement INTEGER NOT NULL,
    gender_at_measurement VARCHAR(16) NOT NULL,

    push_ups_90_sec NUMERIC(8,2) NOT NULL,
    pull_ups NUMERIC(8,2) NOT NULL,
    jump_squats_90_sec NUMERIC(8,2) NOT NULL,
    punch_force_kg NUMERIC(8,2) NOT NULL,
    burpees_5_min NUMERIC(8,2) NOT NULL,
    punches_20_sec NUMERIC(8,2) NOT NULL,
    rope_jumps_60_sec NUMERIC(8,2) NOT NULL,
    double_unders_60_sec NUMERIC(8,2) NOT NULL,

    push_ups_score NUMERIC(5,2) NOT NULL,
    pull_ups_score NUMERIC(5,2) NOT NULL,
    jump_squats_score NUMERIC(5,2) NOT NULL,
    punch_force_score NUMERIC(5,2) NOT NULL,
    burpees_score NUMERIC(5,2) NOT NULL,
    punches_score NUMERIC(5,2) NOT NULL,
    rope_jumps_score NUMERIC(5,2) NOT NULL,
    double_unders_score NUMERIC(5,2) NOT NULL,

    strength_score NUMERIC(5,2) NOT NULL,
    endurance_score NUMERIC(5,2) NOT NULL,
    speed_score NUMERIC(5,2) NOT NULL,
    agility_score NUMERIC(5,2) NOT NULL,
    potential_score NUMERIC(5,2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT ck_boxer_potential_norm_group CHECK (norm_group IN ('MALE_16_PLUS', 'FEMALE', 'CHILD')),
    CONSTRAINT ck_boxer_potential_norm_set CHECK (norm_set IN ('MALE', 'FEMALE_CHILD')),
    CONSTRAINT ck_boxer_potential_age_non_negative CHECK (age_at_measurement >= 0),
    CONSTRAINT ck_boxer_potential_raw_non_negative CHECK (
        push_ups_90_sec >= 0 AND pull_ups >= 0 AND jump_squats_90_sec >= 0 AND punch_force_kg >= 0
        AND burpees_5_min >= 0 AND punches_20_sec >= 0 AND rope_jumps_60_sec >= 0 AND double_unders_60_sec >= 0
    ),
    CONSTRAINT ck_boxer_potential_scores_range CHECK (
        push_ups_score BETWEEN 0 AND 100 AND pull_ups_score BETWEEN 0 AND 100
        AND jump_squats_score BETWEEN 0 AND 100 AND punch_force_score BETWEEN 0 AND 100
        AND burpees_score BETWEEN 0 AND 100 AND punches_score BETWEEN 0 AND 100
        AND rope_jumps_score BETWEEN 0 AND 100 AND double_unders_score BETWEEN 0 AND 100
        AND strength_score BETWEEN 0 AND 100 AND endurance_score BETWEEN 0 AND 100
        AND speed_score BETWEEN 0 AND 100 AND agility_score BETWEEN 0 AND 100
        AND potential_score BETWEEN 0 AND 100
    )
);

CREATE INDEX idx_boxer_potential_member_measured_at
    ON boxer_potential_measurements (member_id, measured_at DESC, created_at DESC);

CREATE INDEX idx_boxer_potential_leaderboard
    ON boxer_potential_measurements (norm_group, potential_score DESC, measured_at DESC);
