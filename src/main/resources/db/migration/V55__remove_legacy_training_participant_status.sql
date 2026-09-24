-- Attendance is owned exclusively by attendance_status; do not translate legacy
-- statuses over the current Sheets/app attendance. V54 already removed legacy sessions.
ALTER TABLE training_participants
    DROP COLUMN status,
    DROP COLUMN cancel_requested_at,
    DROP COLUMN cancel_confirmed_at,
    DROP COLUMN cancel_confirmed_by_user_id,
    DROP COLUMN charged_at,
    DROP COLUMN attended_at;
