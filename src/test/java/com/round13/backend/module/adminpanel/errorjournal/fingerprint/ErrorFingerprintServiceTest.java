package com.round13.backend.module.adminpanel.errorjournal.fingerprint;

import com.round13.backend.domain.CriticalErrorSource;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ErrorFingerprintServiceTest {

    private final ErrorFingerprintService service = new ErrorFingerprintService();

    @Test
    void normalizesDynamicPathSegments() {
        assertThat(service.normalizePath("/api/users/00000000-0000-0000-0000-000000000001/items/42"))
                .isEqualTo("/api/users/{uuid}/items/{id}");
    }

    @Test
    void returnsStableFingerprintForSameErrorShape() {
        IllegalStateException first = new IllegalStateException("first user message");
        IllegalStateException second = new IllegalStateException("second user message");

        String a = service.fingerprint(CriticalErrorSource.BACKEND, first, "GET", "/api/items/1", "INTERNAL_ERROR", 500);
        String b = service.fingerprint(CriticalErrorSource.BACKEND, second, "GET", "/api/items/2", "INTERNAL_ERROR", 500);
        String c = service.fingerprint(CriticalErrorSource.BACKEND, second, "POST", "/api/items/2", "INTERNAL_ERROR", 500);

        assertThat(a).isEqualTo(b);
        assertThat(c).isNotEqualTo(a);
    }
}
