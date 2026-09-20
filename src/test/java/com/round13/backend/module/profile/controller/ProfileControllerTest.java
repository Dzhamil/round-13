package com.round13.backend.module.profile.controller;

import com.round13.backend.module.profile.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.UUID;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProfileControllerTest {
    @Test
    void profileSaveDelegatesToCommandAndValidatesRequest() throws Exception {
        var commands = mock(ProfileCommandService.class);
        var mvc = MockMvcBuilders.standaloneSetup(new ProfileController(mock(ProfileService.class), commands,
                mock(AccountDeletionService.class), mock(WebPasswordService.class))).build();
        UUID id = UUID.randomUUID();
        var principal = new UsernamePasswordAuthenticationToken(id.toString(), null);
        mvc.perform(patch("/api/account/profile").principal(principal).contentType("application/json")
                .content("{\"surname\":\"Иванов\"}")).andExpect(status().isOk());
        verify(commands).updateMyProfile(eq(id), argThat(value -> "Иванов".equals(value.surname())));
        mvc.perform(patch("/api/account/profile").principal(principal).contentType("application/json")
                .content("{\"surname\":\" \"}")).andExpect(status().isBadRequest());
        verifyNoMoreInteractions(commands);
    }

    @Test
    void removedLegacySaveEndpointReturnsNotFound() throws Exception {
        var commands = mock(ProfileCommandService.class);
        var mvc = MockMvcBuilders.standaloneSetup(new ProfileController(mock(ProfileService.class), commands,
                mock(AccountDeletionService.class), mock(WebPasswordService.class))).build();
        var principal = new UsernamePasswordAuthenticationToken(UUID.randomUUID().toString(), null);
        mvc.perform(post("/api/account/complete-profile").principal(principal).contentType("application/json")
                .content("{\"surname\":\"Иванов\"}")).andExpect(status().isNotFound());
        verifyNoInteractions(commands);
    }

    @Test
    void diagnosticAcceptsOnlyFixedReasonCodes() throws Exception {
        var mvc = MockMvcBuilders.standaloneSetup(new ProfileDiagnosticsController()).build();
        var principal = new UsernamePasswordAuthenticationToken(UUID.randomUUID().toString(), null);
        mvc.perform(post("/api/account/profile/diagnostics").principal(principal).contentType("application/json")
                .content("{\"reason\":\"missing_surname\"}")).andExpect(status().isNoContent());
        mvc.perform(post("/api/account/profile/diagnostics").principal(principal).contentType("application/json")
                .content("{\"reason\":\"arbitrary text\"}")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/account/profile/diagnostics").principal(principal).contentType("application/json")
                .content("{}")).andExpect(status().isBadRequest());
    }
}
