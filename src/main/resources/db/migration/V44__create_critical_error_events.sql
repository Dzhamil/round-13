CREATE TABLE critical_error_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    severity VARCHAR(16) NOT NULL,
    source VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'OPEN',

    error_code VARCHAR(64),
    http_status INTEGER,
    exception_class VARCHAR(256),
    error_type VARCHAR(128),
    message VARCHAR(1000),
    stack_trace TEXT,

    request_method VARCHAR(16),
    request_path VARCHAR(512),
    query_string VARCHAR(1000),
    request_id VARCHAR(128),
    fingerprint VARCHAR(128) NOT NULL,

    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    panel_admin_id UUID REFERENCES admin_accounts(id) ON DELETE SET NULL,
    remote_addr VARCHAR(128),
    user_agent VARCHAR(512),

    resolution_note VARCHAR(1000),
    resolved_at TIMESTAMPTZ,
    resolved_by_user_id UUID REFERENCES admin_accounts(id) ON DELETE SET NULL,

    CONSTRAINT ck_critical_error_events_severity CHECK (severity IN ('ERROR', 'CRITICAL', 'CLIENT_ERROR')),
    CONSTRAINT ck_critical_error_events_source CHECK (source IN ('BACKEND', 'FRONTEND')),
    CONSTRAINT ck_critical_error_events_status CHECK (status IN ('OPEN', 'RESOLVED', 'IGNORED')),
    CONSTRAINT ck_critical_error_events_http_status CHECK (http_status IS NULL OR http_status BETWEEN 100 AND 599),
    CONSTRAINT ck_critical_error_events_resolution CHECK (
        (status = 'OPEN' AND resolved_at IS NULL AND resolved_by_user_id IS NULL)
        OR status IN ('RESOLVED', 'IGNORED')
    )
);

CREATE INDEX idx_critical_error_events_status_occurred_at
    ON critical_error_events (status, occurred_at DESC);

CREATE INDEX idx_critical_error_events_occurred_at
    ON critical_error_events (occurred_at DESC);

CREATE INDEX idx_critical_error_events_fingerprint
    ON critical_error_events (fingerprint, occurred_at DESC);

CREATE INDEX idx_critical_error_events_http_status
    ON critical_error_events (http_status);

CREATE INDEX idx_critical_error_events_request_path
    ON critical_error_events (request_path);
