package com.round13.backend.security.jwt;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.security.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Фильтр для аутентификации пользователя по JWT токену.
 * Извлекает токен, проверяет его и сохраняет аутентификацию в контексте.
 */
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    private enum AccessTokenDecision {
        AUTHENTICATE,
        CONTINUE_WITHOUT_AUTHENTICATION,
        REJECTED
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String token = extractToken(request);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (!authenticate(request, response, token)) {
                return;
            }
        } catch (RuntimeException ex) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Извлекает токен из заголовка запроса.
     */
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            return null;
        }
        String token = header.substring(BEARER_PREFIX.length()).trim();
        return token.isEmpty() ? null : token;
    }

    /**
     * Аутентифицирует пользователя по токену.
     */
    private boolean authenticate(HttpServletRequest request, HttpServletResponse response, String token) throws IOException {
        Map<String, Object> claims = jwtService.validateAndParse(token);

        if (!jwtService.isAccessToken(claims)) {
            return true;
        }

        UUID userId = jwtService.getUserId(claims);
        AccessTokenDecision decision = resolveAccessTokenDecision(userId, response);
        if (decision == AccessTokenDecision.REJECTED) {
            return false;
        }
        if (decision == AccessTokenDecision.CONTINUE_WITHOUT_AUTHENTICATION) {
            return true;
        }

        List<String> roles = jwtService.getRoles(claims);

        UsernamePasswordAuthenticationToken authentication = createAuthentication(request, userId, roles);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return true;
    }

    private AccessTokenDecision resolveAccessTokenDecision(UUID userId, HttpServletResponse response) throws IOException {
        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return AccessTokenDecision.CONTINUE_WITHOUT_AUTHENTICATION;
        }
        if (!user.isDeleted()) {
            return AccessTokenDecision.AUTHENTICATE;
        }

        SecurityContextHolder.clearContext();
        writeError(response, ErrorCode.USER_DELETED);
        return AccessTokenDecision.REJECTED;
    }

    private UsernamePasswordAuthenticationToken createAuthentication(
            HttpServletRequest request,
            UUID userId,
            List<String> roles
    ) {
        List<SimpleGrantedAuthority> authorities = roles.stream()
                .map(SimpleGrantedAuthority::new)
                .toList();

        var authentication = new UsernamePasswordAuthenticationToken(userId, null, authorities);
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        return authentication;
    }

    private void writeError(HttpServletResponse response, ErrorCode errorCode) throws IOException {
        HttpStatus status = errorCode.getHttpStatus();
        response.setStatus(status.value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
                "{\"code\":\"" + errorCode.getCode() + "\","
                        + "\"message\":\"" + errorCode.getMessage() + "\","
                        + "\"httpStatus\":" + status.value() + "}"
        );
    }
}
