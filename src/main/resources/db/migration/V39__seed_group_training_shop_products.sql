DO $$
DECLARE
    group_category_id UUID;
BEGIN
    SELECT id
    INTO group_category_id
    FROM shop_categories
    WHERE title = 'Групповая тренировка';

    IF group_category_id IS NULL THEN
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
            'Групповая тренировка',
            'Пакеты для посещения групповых занятий клуба.',
            TRUE,
            'TRAININGS',
            NOW(),
            NOW()
        )
        RETURNING id INTO group_category_id;
    ELSE
        UPDATE shop_categories
        SET description = 'Пакеты для посещения групповых занятий клуба.',
            is_active = TRUE,
            type = 'TRAININGS',
            updated_at = NOW()
        WHERE id = group_category_id;
    END IF;

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
    VALUES (
        '31000000-0000-0000-0000-000000000004',
        'group-single',
        'Разовая групповая тренировка',
        'Разовое посещение групповой тренировки клуба.',
        group_category_id,
        150000,
        'RUB',
        TRUE,
        10,
        'GROUP_TRAININGS',
        1,
        NULL,
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
        trainer_id = NULL,
        updated_at = NOW();

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
    VALUES (
        '31000000-0000-0000-0000-000000000002',
        'group-8',
        '8 групповых тренировок',
        'Пакет для записи на групповые тренировки клуба.',
        group_category_id,
        800000,
        'RUB',
        TRUE,
        20,
        'GROUP_TRAININGS',
        8,
        NULL,
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
        trainer_id = NULL,
        updated_at = NOW();
END $$;
