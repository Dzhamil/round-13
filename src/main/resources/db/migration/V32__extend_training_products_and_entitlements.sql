ALTER TABLE shop_products
    ADD COLUMN IF NOT EXISTS entitlement_type VARCHAR(32),
    ADD COLUMN IF NOT EXISTS entitlement_quantity INT,
    ADD COLUMN IF NOT EXISTS trainer_id UUID;

ALTER TABLE user_entitlements
    ADD COLUMN IF NOT EXISTS product_id UUID,
    ADD COLUMN IF NOT EXISTS remaining_quantity INT,
    ADD COLUMN IF NOT EXISTS trainer_id UUID,
    ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

ALTER TABLE shop_products
    ADD CONSTRAINT fk_shop_products_trainer
        FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE user_entitlements
    ADD CONSTRAINT fk_user_entitlements_product
        FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE SET NULL;

ALTER TABLE user_entitlements
    ADD CONSTRAINT fk_user_entitlements_trainer
        FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE user_entitlements
    ADD CONSTRAINT chk_user_entitlements_remaining_quantity_non_negative
        CHECK (remaining_quantity IS NULL OR remaining_quantity >= 0);
