ALTER TABLE users
    ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE users u
SET phone_verified = TRUE
WHERE EXISTS (
    SELECT 1
    FROM phone_verification pv
    WHERE pv.phone = u.phone
      AND pv.is_verified = TRUE
);
