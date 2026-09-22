ALTER TABLE training_sessions
    ADD COLUMN sheet_import_spreadsheet_id VARCHAR(160),
    ADD COLUMN sheet_import_training_id INTEGER,
    ADD COLUMN sheet_import_date TIMESTAMP,
    ADD COLUMN sheet_import_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD CONSTRAINT ck_training_sheet_import_source CHECK (
        (sheet_import_spreadsheet_id IS NULL AND sheet_import_training_id IS NULL AND sheet_import_date IS NULL)
        OR (sheet_import_spreadsheet_id IS NOT NULL AND sheet_import_training_id IS NOT NULL AND sheet_import_training_id > 0
            AND sheet_import_date IS NOT NULL AND coach_user_id IS NOT NULL AND schedule2_enabled)),
    ADD CONSTRAINT uq_training_sheet_import_source UNIQUE
        (sheet_import_spreadsheet_id, coach_user_id, sheet_import_training_id, sheet_import_date);

ALTER TABLE training_participants
    ADD COLUMN sheet_import_created BOOLEAN NOT NULL DEFAULT FALSE;
