package com.round13.backend.security.jwt;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatus;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.security.JwtService;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class JwtAuthenticationFilterDeletedUserTest {

    private final JwtService jwtService = mock(JwtService.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, userRepository);

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void deletedUserAccessTokenReturnsUserDeletedBeforeController() throws ServletException, IOException {
        String token = "access-token";
        UUID userId = UUID.randomUUID();
        Map<String, Object> claims = Map.of("sub", userId.toString());
        UserEntity deletedUser = new UserEntity();
        deletedUser.setId(userId);
        deletedUser.setStatus(UserStatus.DELETED);

        when(jwtService.validateAndParse(token)).thenReturn(claims);
        when(jwtService.isAccessToken(claims)).thenReturn(true);
        when(jwtService.getUserId(claims)).thenReturn(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(deletedUser));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("\"code\":\"USER_DELETED\"");
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void activeUserAccessTokenAuthenticatesRequest() throws ServletException, IOException {
        String token = "access-token";
        UUID userId = UUID.randomUUID();
        Map<String, Object> claims = Map.of("sub", userId.toString());
        UserEntity activeUser = new UserEntity();
        activeUser.setId(userId);
        activeUser.setStatus(UserStatus.ACTIVE);

        when(jwtService.validateAndParse(token)).thenReturn(claims);
        when(jwtService.isAccessToken(claims)).thenReturn(true);
        when(jwtService.getUserId(claims)).thenReturn(userId);
        when(jwtService.getRoles(claims)).thenReturn(List.of("ROLE_ATHLETE"));
        when(userRepository.findById(userId)).thenReturn(Optional.of(activeUser));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
    }

    @Test
    void missingBearerTokenLeavesRequestUnauthenticated() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtService, userRepository);
    }
}
