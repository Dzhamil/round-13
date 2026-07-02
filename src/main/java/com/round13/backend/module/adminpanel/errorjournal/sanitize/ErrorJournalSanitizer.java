package com.round13.backend.module.adminpanel.errorjournal.sanitize;

import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URI;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class ErrorJournalSanitizer {

    private static final String REDACTED = "[redacted]";
    private static final Pattern CONTROL_CHARS = Pattern.compile("[\\p{Cntrl}&&[^\r\n\t]]");
    private static final Pattern BEARER_TOKEN = Pattern.compile("(?i)bearer\\s+[a-z0-9._~+/=-]+");
    private static final Pattern JWT_LIKE = Pattern.compile("\\beyJ[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+\\b");
    private static final Pattern SECRET_ASSIGNMENT = Pattern.compile(
            "(?i)(password|pass|token|secret|authorization|cookie|signature|hash|initData|payment|card)(\\s*[=:]\\s*)([^\\s,&]+)"
    );
    private static final Set<String> SENSITIVE_KEY_PARTS = Set.of(
            "token",
            "authorization",
            "cookie",
            "password",
            "pass",
            "secret",
            "key",
            "hash",
            "signature",
            "initdata",
            "payment",
            "card"
    );

    public String message(String value) {
        return sanitizeText(value, 1000);
    }

    public String stackTrace(Throwable throwable) {
        if (throwable == null) {
            return null;
        }

        StringWriter buffer = new StringWriter();
        throwable.printStackTrace(new PrintWriter(buffer));
        return sanitizeText(buffer.toString(), 16_000);
    }

    public String stackTraceText(String value) {
        return sanitizeText(value, 16_000);
    }

    public String requestPath(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String cleaned = removeControlChars(value.trim());
        try {
            URI uri = URI.create(cleaned);
            if (uri.getPath() != null) {
                cleaned = uri.getPath();
            }
        } catch (IllegalArgumentException ignored) {
            int queryStart = cleaned.indexOf('?');
            if (queryStart >= 0) {
                cleaned = cleaned.substring(0, queryStart);
            }
        }

        return truncate(cleaned, 512);
    }

    public String queryString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            var builder = UriComponentsBuilder.newInstance();
            UriComponentsBuilder.fromUriString("/?" + value)
                    .build()
                    .getQueryParams()
                    .forEach((key, values) -> {
                        if (isSensitiveKey(key)) {
                            builder.queryParam(key, REDACTED);
                        } else {
                            values.forEach(item -> builder.queryParam(key, sanitizeText(item, 200)));
                        }
                    });
            String sanitized = builder.build().encode().getQuery();
            return truncate(sanitized, 1000);
        } catch (RuntimeException ignored) {
            return sanitizeText(value, 1000);
        }
    }

    public String userAgent(String value) {
        return sanitizeText(value, 512);
    }

    public String remoteAddr(String value) {
        return sanitizeText(value, 128);
    }

    public String shortValue(String value, int maxLength) {
        return sanitizeText(value, maxLength);
    }

    public String resolutionNote(String value) {
        return sanitizeText(value == null ? null : value.trim(), 1000);
    }

    private String sanitizeText(String value, int maxLength) {
        if (value == null) {
            return null;
        }

        String sanitized = removeControlChars(value);
        sanitized = BEARER_TOKEN.matcher(sanitized).replaceAll("Bearer " + REDACTED);
        sanitized = JWT_LIKE.matcher(sanitized).replaceAll(REDACTED);
        sanitized = SECRET_ASSIGNMENT.matcher(sanitized).replaceAll("$1$2" + REDACTED);
        return truncate(sanitized, maxLength);
    }

    private String removeControlChars(String value) {
        return CONTROL_CHARS.matcher(value).replaceAll("");
    }

    private boolean isSensitiveKey(String key) {
        String normalized = key == null ? "" : key.toLowerCase(Locale.ROOT);
        return SENSITIVE_KEY_PARTS.stream().anyMatch(normalized::contains);
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }

        return value.substring(0, maxLength);
    }
}
