CREATE TABLE coach_sheet_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    previous_phone VARCHAR(32)
);
CREATE INDEX idx_coach_sheet_changes_user ON coach_sheet_changes(user_id);
