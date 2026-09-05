ALTER TABLE profiles
    ADD COLUMN surname VARCHAR(128),
    ADD COLUMN first_name VARCHAR(128),
    ADD COLUMN patronymic VARCHAR(128);

ALTER TABLE training_sessions
    ADD COLUMN schedule2_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN timezone VARCHAR(64) NOT NULL DEFAULT 'Europe/Moscow',
    ADD COLUMN version BIGINT NOT NULL DEFAULT 1;

ALTER TABLE training_participants
    ADD COLUMN attendance_status VARCHAR(16) NOT NULL DEFAULT 'ABSENT',
    ADD COLUMN attendance_marked_at TIMESTAMPTZ,
    ADD COLUMN attendance_marked_by_user_id UUID,
    ADD COLUMN attendance_comment TEXT,
    ADD COLUMN attendance_updated_at TIMESTAMPTZ,
    ADD COLUMN attendance_version BIGINT NOT NULL DEFAULT 0,
    ADD CONSTRAINT fk_training_participants_attendance_marked_by
        FOREIGN KEY (attendance_marked_by_user_id) REFERENCES users(id);

CREATE TABLE student_verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_types VARCHAR(128) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    data_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    relationship_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    reviewed_at TIMESTAMPTZ,
    reviewed_by_user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_verification_request_student_trainer UNIQUE (student_id, trainer_id)
);

ALTER TABLE user_trainer_links
    ADD COLUMN training_types VARCHAR(128) NOT NULL DEFAULT 'GROUP';

CREATE TABLE google_sheet_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(160) NOT NULL,
    spreadsheet_url TEXT NOT NULL,
    spreadsheet_id VARCHAR(160) NOT NULL,
    service_account_email VARCHAR(320),
    credentials_env_var VARCHAR(128),
    access_details TEXT,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_google_sheet_spaces_active
    ON google_sheet_spaces (active) WHERE active;

CREATE INDEX idx_schedule2_training_coach_start
    ON training_sessions (coach_user_id, start_time) WHERE schedule2_enabled;

INSERT INTO google_sheet_spaces (
    display_name, spreadsheet_url, spreadsheet_id, access_details, active
) VALUES (
    'Реестр посещений ROUND 13',
    'https://docs.google.com/spreadsheets/d/1p63WUT0LfF0lWgqD9LruS77aPAUUZcBLOGfWzQZsTjM/edit?gid=0#gid=0',
    '1p63WUT0LfF0lWgqD9LruS77aPAUUZcBLOGfWzQZsTjM',
    'Укажите имя переменной окружения с JSON-ключом service account и предоставьте аккаунту права редактора.',
    TRUE
);
