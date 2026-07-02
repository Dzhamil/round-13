package com.round13.backend.module.adminpanel.errorjournal.sanitize;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ErrorJournalSanitizerTest {

    private final ErrorJournalSanitizer sanitizer = new ErrorJournalSanitizer();

    @Test
    void redactsSecretsFromQueryAndText() {
        String query = sanitizer.queryString("token=abc123&password=qwerty&path=/ok&initData=secret");
        String message = sanitizer.message("Authorization: Bearer eyJabc.def.ghi password=secret");

        assertThat(query).contains("token=%5Bredacted%5D");
        assertThat(query).contains("password=%5Bredacted%5D");
        assertThat(query).contains("initData=%5Bredacted%5D");
        assertThat(query).contains("path=/ok");
        assertThat(message).doesNotContain("eyJabc.def.ghi");
        assertThat(message).doesNotContain("password=secret");
    }

    @Test
    void truncatesLongValues() {
        String value = "x".repeat(1200);

        assertThat(sanitizer.message(value)).hasSize(1000);
    }
}
