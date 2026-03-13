ALTER TABLE shop_categories
    ADD COLUMN IF NOT EXISTS preview_image bytea,
    ADD COLUMN IF NOT EXISTS preview_image_content_type varchar(100);

ALTER TABLE shop_categories DROP COLUMN preview_image_url;