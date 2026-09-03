UPDATE users
SET phone = CASE
    WHEN regexp_replace(phone, '[^0-9]', '', 'g') ~ '^8[0-9]{10}$'
        THEN '+7' || substring(regexp_replace(phone, '[^0-9]', '', 'g') FROM 2)
    WHEN regexp_replace(phone, '[^0-9]', '', 'g') ~ '^7[0-9]{10}$'
        THEN '+' || regexp_replace(phone, '[^0-9]', '', 'g')
    WHEN regexp_replace(phone, '[^0-9]', '', 'g') ~ '^9[0-9]{9}$'
        THEN '+7' || regexp_replace(phone, '[^0-9]', '', 'g')
    ELSE phone
END
WHERE phone IS NOT NULL;

-- Старые Telegram-пользователи получали случайную строку вместо настоящего hash.
UPDATE users SET password_hash = NULL
WHERE password_hash IS NOT NULL AND password_hash NOT LIKE '$2%';
