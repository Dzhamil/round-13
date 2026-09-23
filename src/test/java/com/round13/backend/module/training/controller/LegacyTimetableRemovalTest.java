package com.round13.backend.module.training.controller;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:legacy_removed;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.jwt.secret=round13-isolated-legacy-removal-test-secret"
})
@AutoConfigureMockMvc
class LegacyTimetableRemovalTest {
    @Autowired MockMvc mvc;
    @Autowired RequestMappingHandlerMapping requestMappingHandlerMapping;

    @ParameterizedTest
    @CsvSource({
            "GET, /api/account/schedule",
            "POST, /api/account/schedule/00000000-0000-0000-0000-000000000001/cancel-request",
            "GET, /api/trainer/schedule",
            "POST, /api/trainer/personal-trainings",
            "POST, /api/trainer/schedule/00000000-0000-0000-0000-000000000001/confirm-cancellation",
            "POST, /api/trainer/schedule/00000000-0000-0000-0000-000000000001/mark-attended",
            "POST, /api/trainer/schedule/00000000-0000-0000-0000-000000000001/mark-no-show",
            "POST, /api/trainer/schedule/00000000-0000-0000-0000-000000000001/cancel-by-trainer"
    })
    @WithMockUser(roles = {"ADMIN", "COACH"})
    void legacyHandlersAreAbsentEvenForAuthorizedUsers(String method, String path) throws Exception {
        assertThat(requestMappingHandlerMapping.getHandlerMethods().keySet())
                .flatExtracting(mapping -> mapping.getPatternValues())
                .noneMatch(pattern -> pattern.startsWith("/api/account/schedule")
                        || pattern.startsWith("/api/trainer/schedule")
                        || pattern.startsWith("/api/trainer/personal-trainings"));
        mvc.perform(request(HttpMethod.valueOf(method), path)).andExpect(status().isNotFound());
    }
}
