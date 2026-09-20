package com.round13.backend.security;

import com.round13.backend.module.adminpanel.service.AdminPanelUserDetailsService;
import com.round13.backend.module.adminpanel.errorjournal.capture.CriticalErrorCaptureService;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApiSecurityEntryPointTest.ProtectedAccountController.class)
@Import(SecurityConfig.class)
class ApiSecurityEntryPointTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private AdminPanelUserDetailsService adminPanelUserDetailsService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private CriticalErrorCaptureService criticalErrorCaptureService;

    @Test
    void protectedApiReturnsJsonUnauthorizedForWebAcceptWithoutBearer() throws Exception {
        mockMvc.perform(patch("/api/account/profile")
                        .accept(MediaType.TEXT_HTML, MediaType.APPLICATION_XHTML_XML))
                .andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist("Location"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("AUTH_REQUIRED"))
                .andExpect(jsonPath("$.message").value("Требуется авторизация"))
                .andExpect(jsonPath("$.httpStatus").value(401));
    }

    @RestController
    @RequestMapping("/api/account")
    static class ProtectedAccountController {

        @PatchMapping("/profile")
        void updateProfile() {
        }
    }
}
