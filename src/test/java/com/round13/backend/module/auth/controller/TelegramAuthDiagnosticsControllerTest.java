package com.round13.backend.module.auth.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TelegramAuthDiagnosticsControllerTest {
    private MockMvc mvc;
    private static final String EVENT = """
            {"category":"init_data_timeout","hasInitData":false,"initDataLength":0,
            "platform":"ios","webAppVersion":"8.0","route":"/auth","release":"abcdef123456","elapsedMs":4000,"attemptCount":0}
            """;

    @BeforeEach
    void setup() {
        mvc = MockMvcBuilders.standaloneSetup(new TelegramAuthDiagnosticsController()).build();
    }

    @Test
    void acceptsSafeMetadata() throws Exception {
        send(EVENT, 204);
    }

    @Test
    void rejectsUnboundedOrSensitiveFields() throws Exception {
        send(EVENT.replace("4000", "300001"), 400);
        send(EVENT.replace("ios", "hash=secret"), 400);
        send(EVENT.replace("/auth", "/auth?token=secret"), 400);
        send(EVENT.replace("init_data_timeout", "secret"), 400);
    }

    @Test
    void rejectsMalformedPayloadWithoutGlobalExceptionLogging() throws Exception {
        send("{\"category\": secret", 400);
    }

    private void send(String payload, int expectedStatus) throws Exception {
        mvc.perform(post("/api/auth/telegram-diagnostics").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().is(expectedStatus));
    }
}
