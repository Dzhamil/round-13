package com.round13.backend.security.jwt;

import com.round13.backend.domain.*;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.profile.service.ProfileAccessService;
import com.round13.backend.module.profile.service.ProfileServiceUtil;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.mock.web.*;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfileAccessFilterTest {
    final UserRepository users = mock(UserRepository.class);
    final ProfileRepository profiles = mock(ProfileRepository.class);
    final JwtService jwt = mock(JwtService.class);
    final ProfileAccessService access = new ProfileAccessService(profiles, users, new ProfileServiceUtil());
    final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwt, users, access);
    final UserEntity user = new UserEntity();
    final ProfileEntity profile = new ProfileEntity();

    ProfileAccessFilterTest() {
        user.setId(UUID.randomUUID());
        user.setStatus(UserStatus.PROFILE_INCOMPLETE);
        var claims = Map.<String, Object>of("sub", user.getId().toString());
        when(jwt.validateAndParse("token")).thenReturn(claims);
        when(jwt.isAccessToken(claims)).thenReturn(true);
        when(jwt.getUserId(claims)).thenReturn(user.getId());
        when(jwt.getRoles(claims)).thenReturn(List.of("ROLE_ATHLETE"));
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        when(profiles.findByUserId(user.getId())).thenReturn(Optional.of(profile));
    }

    @AfterEach void clear() { SecurityContextHolder.clearContext(); }

    @ParameterizedTest
    @CsvSource({"GET,/api/members", "GET,/api/shop/products", "GET,/api/training-sessions",
            "POST,/api/events/123/join", "GET,/api/stats/me", "GET,/api/members/123",
            "PATCH,/api/account/profile/about", "DELETE,/api/account/me", "PUT,/api/account/web-password",
            "POST,/api/account/profile", "GET,/api/account/me/extra"})
    void incompleteUserCannotReachClubApis(String method, String path) throws Exception {
        assertRequest(method, path, 403);
    }

    @ParameterizedTest
    @CsvSource({"GET,/api/account/me", "PATCH,/api/account/profile", "POST,/api/auth/refresh",
            "POST,/api/auth/logout", "POST,/api/auth/login", "POST,/api/auth/telegram-login"})
    void incompleteUserCanOnlyUseCompletionAndSessionEndpoints(String method, String path) throws Exception {
        assertRequest(method, path, 200);
    }

    @ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings = {"surname", "firstName", "patronymic", "phone"})
    void staleActiveUserIsDemotedForEachMissingIdentityField(String missing) throws Exception {
        complete();
        switch (missing) {
            case "surname" -> profile.setSurname(" ");
            case "firstName" -> profile.setFirstName(null);
            case "patronymic" -> profile.setPatronymic("");
            case "phone" -> user.setPhone(null);
        }
        assertRequest("GET", "/api/members", 403);
        assertThat(user.getStatus()).isEqualTo(UserStatus.PROFILE_INCOMPLETE);
        verify(users).save(user);
    }

    @Test void completeActiveUserCanAccessClubApis() throws Exception {
        complete();
        assertRequest("GET", "/api/members", 200);
    }

    @Test void completeFieldsDoNotSilentlyActivateIncompleteStatus() throws Exception {
        complete(); user.setStatus(UserStatus.PROFILE_INCOMPLETE);
        assertRequest("GET", "/api/members", 403);
    }

    @Test void permanentlyDeletedUserCannotReadOwnProfile() throws Exception {
        complete(); user.setPermanentlyDeleted(true);
        assertRequest("GET", "/api/account/me", 403);
    }

    private void complete() {
        user.setStatus(UserStatus.ACTIVE); user.setPhone("+79991234567");
        profile.setSurname("Surname"); profile.setFirstName("First"); profile.setPatronymic("Patronymic");
    }

    private void assertRequest(String method, String path, int status) throws Exception {
        var request = new MockHttpServletRequest(method, path);
        request.addHeader("Authorization", "Bearer token");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        filter.doFilter(request, response, chain);
        assertThat(response.getStatus()).isEqualTo(status);
        if (status == 403) assertThat(chain.getRequest()).isNull();
        else assertThat(chain.getRequest()).isSameAs(request);
    }
}
