package com.round13.backend.module.sheets.integration;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SheetsCredentialsProviderTest {
    @Test
    void missingCredentialsRetainConfigurationDiagnostic() {
        var provider = new ServiceAccountCredentialsProvider(name -> null);
        assertThatThrownBy(() -> provider.credentials("SHEETS_KEY"))
                .isInstanceOfSatisfying(ResponseStatusException.class, ex -> {
                    assertThat(ex.getStatusCode().value()).isEqualTo(503);
                    assertThat(ex.getReason()).isEqualTo("Нет credentials в переменной окружения SHEETS_KEY");
                });
        assertThatThrownBy(() -> provider.credentials(null)).hasMessageContaining("(не настроена)");
    }

    @Test
    void rejectsMalformedOrNonServiceAccountCredentialsWithoutEchoingTheirContents() {
        var provider = new ServiceAccountCredentialsProvider(name -> "not-a-key-secret");
        assertThatThrownBy(() -> provider.credentials("SHEETS_KEY"))
                .isInstanceOfSatisfying(ResponseStatusException.class, ex ->
                        assertThat(ex.getReason()).isEqualTo("Не удалось авторизовать service account"));
    }
}
