DO $$
DECLARE
    training_category_id UUID;
    default_trainer_id UUID;
BEGIN
    SELECT id
    INTO training_category_id
    FROM shop_categories
    WHERE type = 'TRAININGS'
    ORDER BY created_at NULLS LAST, id
    LIMIT 1;

    IF training_category_id IS NULL THEN
        INSERT INTO shop_categories (
            id,
            title,
            description,
            is_active,
            type,
            created_at,
            updated_at
        )
        VALUES (
            '30000000-0000-0000-0000-000000000002',
            'Тренировки',
            'Каталог групповых и персональных тренировок клуба.',
            TRUE,
            'TRAININGS',
            NOW(),
            NOW()
        )
        RETURNING id INTO training_category_id;
    ELSE
        UPDATE shop_categories
        SET is_active = TRUE,
            type = 'TRAININGS',
            updated_at = NOW()
        WHERE id = training_category_id;
    END IF;

    SELECT u.id
    INTO default_trainer_id
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE r.code = 'COACH'
      AND u.status = 'ACTIVE'
    ORDER BY u.created_at NULLS LAST, u.id
    LIMIT 1;

    INSERT INTO shop_products (
        id,
        code,
        title,
        description,
        category_id,
        price_amount,
        currency,
        is_active,
        sort_order,
        entitlement_type,
        entitlement_quantity,
        trainer_id,
        created_at,
        updated_at
    )
    VALUES
        (
            '31000000-0000-0000-0000-000000000101',
            'group-mon-wed-fri-1900',
            'Группа пн, ср, пт - 19:00',
            'Групповые тренировки по расписанию: понедельник, среда, пятница в 19:00.',
            training_category_id,
            800000,
            'RUB',
            TRUE,
            101,
            'GROUP_TRAININGS',
            8,
            NULL,
            NOW(),
            NOW()
        ),
        (
            '31000000-0000-0000-0000-000000000102',
            'group-mon-wed-fri-2000',
            'Группа пн, ср, пт - 20:00',
            'Групповые тренировки по расписанию: понедельник, среда, пятница в 20:00.',
            training_category_id,
            800000,
            'RUB',
            TRUE,
            102,
            'GROUP_TRAININGS',
            8,
            NULL,
            NOW(),
            NOW()
        ),
        (
            '31000000-0000-0000-0000-000000000103',
            'group-tue-thu-1900-sat-1100',
            'Группа вт, чт - 19:00; сб - 11:00',
            'Групповые тренировки по расписанию: вторник, четверг в 19:00 и суббота в 11:00.',
            training_category_id,
            800000,
            'RUB',
            TRUE,
            103,
            'GROUP_TRAININGS',
            8,
            NULL,
            NOW(),
            NOW()
        ),
        (
            '31000000-0000-0000-0000-000000000104',
            'kids-12-16-mon-wed-fri-1730',
            'Дет. группа 12-16 лет - пн, ср, пт - 17:30',
            'Детская группа 12-16 лет по расписанию: понедельник, среда, пятница в 17:30.',
            training_category_id,
            800000,
            'RUB',
            TRUE,
            104,
            'GROUP_TRAININGS',
            8,
            NULL,
            NOW(),
            NOW()
        ),
        (
            '31000000-0000-0000-0000-000000000105',
            'kids-7-11-mon-wed-fri-1600',
            'Дет. группа 7-11 лет - пн, ср, пт - 16:00',
            'Детская группа 7-11 лет по расписанию: понедельник, среда, пятница в 16:00.',
            training_category_id,
            800000,
            'RUB',
            TRUE,
            105,
            'GROUP_TRAININGS',
            8,
            NULL,
            NOW(),
            NOW()
        ),
        (
            '31000000-0000-0000-0000-000000000201',
            'personal-base',
            'Тариф - База',
            'Персональный тариф База.',
            training_category_id,
            1200000,
            'RUB',
            TRUE,
            201,
            'PERSONAL_TRAININGS',
            4,
            default_trainer_id,
            NOW(),
            NOW()
        ),
        (
            '31000000-0000-0000-0000-000000000202',
            'personal-pro',
            'Тариф - ПРО',
            'Персональный тариф ПРО.',
            training_category_id,
            1800000,
            'RUB',
            TRUE,
            202,
            'PERSONAL_TRAININGS',
            8,
            default_trainer_id,
            NOW(),
            NOW()
        ),
        (
            '31000000-0000-0000-0000-000000000203',
            'personal-premium',
            'Тариф - Премиум',
            'Персональный тариф Премиум.',
            training_category_id,
            2400000,
            'RUB',
            TRUE,
            203,
            'PERSONAL_TRAININGS',
            12,
            default_trainer_id,
            NOW(),
            NOW()
        ),
        (
            '31000000-0000-0000-0000-000000000204',
            'personal-vip',
            'Тариф - VIP',
            'Персональный тариф VIP.',
            training_category_id,
            3200000,
            'RUB',
            TRUE,
            204,
            'PERSONAL_TRAININGS',
            16,
            default_trainer_id,
            NOW(),
            NOW()
        )
    ON CONFLICT (code) DO UPDATE
    SET title = EXCLUDED.title,
        description = EXCLUDED.description,
        category_id = EXCLUDED.category_id,
        price_amount = EXCLUDED.price_amount,
        currency = EXCLUDED.currency,
        is_active = TRUE,
        sort_order = EXCLUDED.sort_order,
        entitlement_type = EXCLUDED.entitlement_type,
        entitlement_quantity = EXCLUDED.entitlement_quantity,
        trainer_id = COALESCE(shop_products.trainer_id, EXCLUDED.trainer_id),
        updated_at = NOW();
END $$;
