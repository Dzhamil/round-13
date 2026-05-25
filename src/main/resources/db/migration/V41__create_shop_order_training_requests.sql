CREATE TABLE shop_order_training_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL UNIQUE,
    product_id UUID NOT NULL,
    trainer_id UUID,
    requested_start_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_shop_order_training_requests_item
        FOREIGN KEY (order_item_id) REFERENCES shop_order_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_shop_order_training_requests_product
        FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_shop_order_training_requests_trainer
        FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_shop_order_training_requests_item
    ON shop_order_training_requests (order_item_id);

CREATE INDEX idx_shop_order_training_requests_product
    ON shop_order_training_requests (product_id);

CREATE INDEX idx_shop_order_training_requests_requested_start_time
    ON shop_order_training_requests (requested_start_time);
