package com.round13.backend.module.adminpanel.errorjournal.controller;

import com.round13.backend.domain.CriticalErrorSeverity;
import com.round13.backend.domain.CriticalErrorSource;
import com.round13.backend.domain.CriticalErrorStatus;
import com.round13.backend.module.adminpanel.errorjournal.capture.CriticalErrorCaptureService;
import com.round13.backend.module.adminpanel.errorjournal.dto.ErrorJournalDetailResponse;
import com.round13.backend.module.adminpanel.errorjournal.dto.ErrorJournalPageResponse;
import com.round13.backend.module.adminpanel.errorjournal.service.PanelErrorJournalService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PanelErrorJournalController.class)
@Import(PanelErrorJournalControllerSecurityTest.MethodSecurityTestConfig.class)
class PanelErrorJournalControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PanelErrorJournalService service;

    @MockBean
    private CriticalErrorCaptureService captureService;

    @TestConfiguration
    @EnableMethodSecurity
    static class MethodSecurityTestConfig {
    }

    @Test
    void listRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/panel/error-journal"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ATHLETE")
    void listRejectsNonPanelAdmin() throws Exception {
        mockMvc.perform(get("/api/panel/error-journal"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PANEL_ADMIN")
    void listAllowsPanelAdmin() throws Exception {
        when(service.list(any())).thenReturn(new ErrorJournalPageResponse(List.of(), 0, 25, 0, 0));

        mockMvc.perform(get("/api/panel/error-journal"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001", roles = "PANEL_ADMIN")
    void statusUpdateAllowsPanelAdmin() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.updateStatus(any(), any(), any(), any())).thenReturn(detail(id));

        mockMvc.perform(patch("/api/panel/error-journal/{id}/status", id)
                        .with(csrf())
                        .contentType("application/json")
                        .content("{\"status\":\"RESOLVED\",\"note\":\"fixed\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));
    }

    private ErrorJournalDetailResponse detail(UUID id) {
        return new ErrorJournalDetailResponse(
                id,
                OffsetDateTime.now(),
                OffsetDateTime.now(),
                CriticalErrorSeverity.ERROR,
                CriticalErrorSource.BACKEND,
                CriticalErrorStatus.RESOLVED,
                "INTERNAL_ERROR",
                500,
                "java.lang.IllegalStateException",
                "IllegalStateException",
                "boom",
                "stack",
                "GET",
                "/api/test",
                null,
                null,
                "fingerprint",
                null,
                null,
                null,
                null,
                "fixed",
                OffsetDateTime.now(),
                UUID.randomUUID()
        );
    }
}
