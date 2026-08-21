ALTER TABLE boxer_potential_measurements
    ADD COLUMN updated_by_user_id UUID REFERENCES users(id) ON DELETE RESTRICT;

UPDATE boxer_potential_measurements
SET updated_by_user_id = created_by_user_id
WHERE updated_by_user_id IS NULL;
