ALTER TABLE users ADD COLUMN trainer BOOLEAN NOT NULL DEFAULT FALSE;

-- ADMIN is management permission, never evidence of trainer identity.
UPDATE users SET trainer = TRUE
WHERE role_id IN (SELECT id FROM roles WHERE code = 'COACH');
