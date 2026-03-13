ALTER TABLE shop_products
    ADD COLUMN IF NOT EXISTS image_data bytea,
    ADD COLUMN IF NOT EXISTS image_content_type varchar(100);
