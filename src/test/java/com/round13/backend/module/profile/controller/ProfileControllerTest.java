package com.round13.backend.module.profile.controller;

import com.round13.backend.module.profile.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
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
                mock(AccountDeletionService.class), mock(WebPasswordService.class), mock(ProfileAvatarStorageService.class))).build();
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
                mock(AccountDeletionService.class), mock(WebPasswordService.class), mock(ProfileAvatarStorageService.class))).build();
        var principal = new UsernamePasswordAuthenticationToken(UUID.randomUUID().toString(), null);
        mvc.perform(post("/api/account/complete-profile").principal(principal).contentType("application/json")
                .content("{\"surname\":\"Иванов\"}")).andExpect(status().isNotFound());
        verifyNoInteractions(commands);
    }

    @Test
    void avatarUploadStoresFileAndSavesOnlyReturnedUrl() throws Exception {
        var commands = mock(ProfileCommandService.class);
        var avatars = mock(ProfileAvatarStorageService.class);
        var mvc = MockMvcBuilders.standaloneSetup(new ProfileController(mock(ProfileService.class), commands,
                mock(AccountDeletionService.class), mock(WebPasswordService.class), avatars)).build();
        UUID id = UUID.randomUUID();
        var principal = new UsernamePasswordAuthenticationToken(id.toString(), null);
        var file = new MockMultipartFile("file", "avatar.jpg", "image/jpeg", new byte[]{1, 2, 3});
        when(avatars.store(eq(id), any())).thenReturn("/uploads/avatars/avatar.jpg");

        mvc.perform(multipart("/api/account/profile/avatar").file(file).principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value("/uploads/avatars/avatar.jpg"));

        verify(avatars).store(eq(id), any());
        verify(commands).updateAvatar(id, "/uploads/avatars/avatar.jpg");
        verifyNoMoreInteractions(commands);
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
