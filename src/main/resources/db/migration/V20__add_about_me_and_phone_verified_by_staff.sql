-- src/main/resources/db/migration/V20__add_about_me_and_phone_verified_by_staff.sql

-- Поле "О себе"
ALTER TABLE profiles
    ADD COLUMN about_me TEXT;

-- Флаг верификации телефона тренером/админом
ALTER TABLE users
    ADD COLUMN phone_verified_by_staff BOOLEAN NOT NULL DEFAULT FALSE;
