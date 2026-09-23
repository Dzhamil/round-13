ALTER TABLE training_sessions
    ADD COLUMN attendance_sheet_sync_status varchar(16) NOT NULL DEFAULT 'NEW',
    ADD COLUMN attendance_sheet_sync_attempted_at timestamptz,
    ADD COLUMN attendance_sheet_synced_at timestamptz,
    ADD CONSTRAINT chk_attendance_sheet_sync_status
        CHECK (attendance_sheet_sync_status IN ('NEW', 'NOT_SYNCED', 'SYNCED'));

-- Existing app-confirmed attendance must also be protected from an initial import.
UPDATE training_sessions s
SET attendance_sheet_sync_status = 'NOT_SYNCED'
WHERE s.schedule2_enabled = true AND EXISTS (
    SELECT 1 FROM training_participants p
    WHERE p.session_id = s.id AND p.attendance_marked_at IS NOT NULL
);
