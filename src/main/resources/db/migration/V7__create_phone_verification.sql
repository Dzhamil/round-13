CREATE TABLE phone_verification
(
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone                 VARCHAR(32) NOT NULL,
    verification_code_hash VARCHAR(255) NOT NULL,
    attempts_count        INTEGER NOT NULL,
    last_attempt_time     TIMESTAMP NOT NULL,
    is_verified           BOOLEAN NOT NULL
);

CREATE UNIQUE INDEX ux_phone_verification_phone
    ON phone_verification (phone);
