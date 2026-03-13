-- Создаём динамическую схему магазина.
-- Удалите старые файлы V10__create_shop_tables.sql и V22__create_shop_category_meta.sql.

-- Таблица категорий магазина
CREATE TABLE shop_categories (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 title VARCHAR(128) NOT NULL UNIQUE,
                                 description VARCHAR(2000) NOT NULL,
                                 preview_image_url VARCHAR(1000),
                                 is_active BOOLEAN NOT NULL DEFAULT TRUE,
                                 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица товаров
CREATE TABLE shop_products (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               code VARCHAR(64) NOT NULL UNIQUE,
                               title VARCHAR(256) NOT NULL,
                               description TEXT,
                               category_id UUID NOT NULL REFERENCES shop_categories(id) ON DELETE RESTRICT,
                               price_amount INT NOT NULL,
                               currency VARCHAR(8) NOT NULL DEFAULT 'RUB',
                               image_url VARCHAR(512),
                               is_active BOOLEAN NOT NULL DEFAULT TRUE,
                               sort_order INT NOT NULL DEFAULT 0,
                               created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                               updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shop_products_category ON shop_products (category_id);
CREATE INDEX idx_shop_products_active ON shop_products (is_active);
CREATE INDEX idx_shop_products_sort ON shop_products (sort_order);

-- Таблица заказов
CREATE TABLE shop_orders (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             user_id UUID NOT NULL,
                             status VARCHAR(16) NOT NULL,
                             total_amount INT NOT NULL,
                             currency VARCHAR(8) NOT NULL DEFAULT 'RUB',
                             payment_provider VARCHAR(32),
                             provider_payment_id VARCHAR(128),
                             created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                             updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                             CONSTRAINT fk_shop_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_shop_orders_user ON shop_orders (user_id);
CREATE INDEX idx_shop_orders_status ON shop_orders (status);

-- Таблица позиций заказа
CREATE TABLE shop_order_items (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  order_id UUID NOT NULL,
                                  product_id UUID NOT NULL,
                                  quantity INT NOT NULL,
                                  unit_amount INT NOT NULL,
                                  line_amount INT NOT NULL,
                                  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                  CONSTRAINT fk_shop_order_items_order FOREIGN KEY (order_id) REFERENCES shop_orders(id) ON DELETE CASCADE,
                                  CONSTRAINT fk_shop_order_items_product FOREIGN KEY (product_id) REFERENCES shop_products(id),
                                  CONSTRAINT chk_shop_order_items_qty CHECK (quantity > 0)
);

CREATE INDEX idx_shop_order_items_order ON shop_order_items (order_id);

-- Таблица начислений услуг (без изменений)
CREATE TABLE user_entitlements (
                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   user_id UUID NOT NULL,
                                   source_order_id UUID,
                                   type VARCHAR(32) NOT NULL,
                                   quantity INT,
                                   valid_until TIMESTAMPTZ,
                                   note VARCHAR(512),
                                   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                   CONSTRAINT fk_user_entitlements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                   CONSTRAINT fk_user_entitlements_order FOREIGN KEY (source_order_id) REFERENCES shop_orders(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_entitlements_user ON user_entitlements (user_id);
CREATE INDEX idx_user_entitlements_type ON user_entitlements (type);
