package com.round13.backend.module.adminpanel.errorjournal.fingerprint;

import com.round13.backend.domain.CriticalErrorSource;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.regex.Pattern;

@Component
public class ErrorFingerprintService {

    private static final Pattern UUID_SEGMENT = Pattern.compile("(?i)/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=/|$)");
    private static final Pattern NUMERIC_SEGMENT = Pattern.compile("/\\d+(?=/|$)");

    public String fingerprint(
            CriticalErrorSource source,
            Throwable throwable,
            String requestMethod,
            String requestPath,
            String errorCode,
            Integer httpStatus
    ) {
        String material = String.join("|",
                value(source),
                exceptionClass(throwable),
                topApplicationFrame(throwable),
                value(requestMethod),
                normalizePath(requestPath),
                value(errorCode),
                value(httpStatus)
        );

        return sha256Hex(material).substring(0, 40);
    }

    public String normalizePath(String requestPath) {
        if (requestPath == null || requestPath.isBlank()) {
            return "";
        }

        String withoutUuid = UUID_SEGMENT.matcher(requestPath).replaceAll("/{uuid}");
        return NUMERIC_SEGMENT.matcher(withoutUuid).replaceAll("/{id}");
    }

    private String exceptionClass(Throwable throwable) {
        return throwable == null ? "" : throwable.getClass().getName();
    }

    private String topApplicationFrame(Throwable throwable) {
        if (throwable == null) {
            return "";
        }

        for (StackTraceElement frame : throwable.getStackTrace()) {
            if (frame.getClassName().startsWith("com.round13.backend")) {
                return frame.getClassName() + "#" + frame.getMethodName();
            }
        }

        StackTraceElement[] frames = throwable.getStackTrace();
        if (frames.length == 0) {
            return "";
        }

        StackTraceElement frame = frames[0];
        return frame.getClassName() + "#" + frame.getMethodName();
    }

    private String value(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }
}
