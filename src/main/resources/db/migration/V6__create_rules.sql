CREATE TABLE rules (
                       id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       code         VARCHAR(64)  NOT NULL UNIQUE,
                       title        VARCHAR(256) NOT NULL,
                       content      TEXT         NOT NULL,
                       sort_order   INT          NOT NULL,
                       created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
                       updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_rules_sort_order ON rules (sort_order);
