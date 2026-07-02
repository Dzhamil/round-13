package com.round13.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "critical_error_events")
@Getter
@Setter
@NoArgsConstructor
public class CriticalErrorEventEntity {

    public static final int MESSAGE_MAX_LENGTH = 1000;
    public static final int STACK_TRACE_MAX_LENGTH = 16_000;
    public static final int REQUEST_PATH_MAX_LENGTH = 512;
    public static final int QUERY_STRING_MAX_LENGTH = 1000;
    public static final int USER_AGENT_MAX_LENGTH = 512;
    public static final int RESOLUTION_NOTE_MAX_LENGTH = 1000;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "occurred_at", nullable = false)
    private OffsetDateTime occurredAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 16)
    private CriticalErrorSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 16)
    private CriticalErrorSource source;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private CriticalErrorStatus status = CriticalErrorStatus.OPEN;

    @Column(name = "error_code", length = 64)
    private String errorCode;

    @Column(name = "http_status")
    private Integer httpStatus;

    @Column(name = "exception_class", length = 256)
    private String exceptionClass;

    @Column(name = "error_type", length = 128)
    private String errorType;

    @Column(name = "message", length = MESSAGE_MAX_LENGTH)
    private String message;

    @Column(name = "stack_trace", length = STACK_TRACE_MAX_LENGTH)
    private String stackTrace;

    @Column(name = "request_method", length = 16)
    private String requestMethod;

    @Column(name = "request_path", length = REQUEST_PATH_MAX_LENGTH)
    private String requestPath;

    @Column(name = "query_string", length = QUERY_STRING_MAX_LENGTH)
    private String queryString;

    @Column(name = "request_id", length = 128)
    private String requestId;

    @Column(name = "fingerprint", nullable = false, length = 128)
    private String fingerprint;

    @Column(name = "actor_user_id")
    private UUID actorUserId;

    @Column(name = "panel_admin_id")
    private UUID panelAdminId;

    @Column(name = "remote_addr", length = 128)
    private String remoteAddr;

    @Column(name = "user_agent", length = USER_AGENT_MAX_LENGTH)
    private String userAgent;

    @Column(name = "resolution_note", length = RESOLUTION_NOTE_MAX_LENGTH)
    private String resolutionNote;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    @Column(name = "resolved_by_user_id")
    private UUID resolvedByUserId;
}
