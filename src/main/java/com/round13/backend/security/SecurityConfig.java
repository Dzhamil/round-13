package com.round13.backend.security;

import com.round13.backend.module.adminpanel.service.AdminPanelUserDetailsService;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.security.jwt.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Конфигурация безопасности приложения. Определяет две цепочки фильтров:
 * одну для админ‑панели (stateful, formLogin), вторую для остальных API (stateless, JWT).
 */
@Configuration(proxyBeanMethods = false)
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_COACH = "COACH";
    private static final String ROLE_PANEL_ADMIN = "PANEL_ADMIN";

    private static final String[] COACH_OR_ADMIN_ROLES = {ROLE_COACH, ROLE_ADMIN};
    private static final String[] PUBLIC_DOCUMENTATION_ENDPOINTS = {"/swagger-ui/**", "/v3/api-docs/**", "/actuator/**"};
    private static final String[] STATIC_PANEL_ENDPOINTS = {"/admin/**", "/panel/**"};
    private static final String[] PUBLIC_AUTH_ENDPOINTS = {
            "/api/auth/telegram-login", "/api/auth/telegram-recovery-login", "/api/auth/telegram-link",
            "/api/auth/telegram-contact-webhook", "/api/auth/login", "/api/auth/refresh"
    };
    private static final String[] PUBLIC_SHOP_ENDPOINTS = {"/api/shop/categories/**", "/api/shop/products/**"};

    private static final String API_PATTERN = "/**";
    private static final String PANEL_API_PATTERN = "/api/panel/**";
    private static final String PANEL_LOGIN_PATH = "/api/panel/auth/login";
    private static final String PANEL_LOGOUT_PATH = "/api/panel/auth/logout";
    private static final String PANEL_TOKEN_PATH = "/api/panel/auth/token";
    private static final String PANEL_LOGIN_PARAMETER = "login";
    private static final String PANEL_PASSWORD_PARAMETER = "password";
    private static final String DEFAULT_AUTH_FAILURE_MESSAGE = "Неверный логин или пароль";
    private static final String PANEL_UNAUTHORIZED_CODE = "PANEL_AUTH_REQUIRED";
    private static final String PANEL_UNAUTHORIZED_MESSAGE = "Требуется вход в админ-панель";
    private static final String PANEL_FORBIDDEN_CODE = "PANEL_ACCESS_DENIED";
    private static final String PANEL_FORBIDDEN_MESSAGE = "Недостаточно прав для админ-панели";
    private static final String INVALID_CREDENTIALS_CODE = "INVALID_CREDENTIALS";

    private final JwtService jwtService;
    private final AdminPanelUserDetailsService adminPanelUserDetailsService;
    private final UserRepository userRepository;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtService, userRepository);
    }

    /**
     * Цепочка безопасности для админ‑панели (приоритет 1).
     */
    @Bean
    @Order(1)
    public SecurityFilterChain adminPanelSecurityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher(PANEL_API_PATTERN);

        http.csrf(csrf -> csrf.disable());
        http.cors(Customizer.withDefaults());
        http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.ALWAYS));

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, PANEL_LOGIN_PATH).permitAll()
                .requestMatchers(HttpMethod.POST, PANEL_LOGOUT_PATH).permitAll()
                .requestMatchers(HttpMethod.POST, PANEL_TOKEN_PATH).permitAll()
                .anyRequest().hasRole(ROLE_PANEL_ADMIN)
        );

        // подключаем UserDetailsService для администраторов панели
        http.userDetailsService(adminPanelUserDetailsService);

        http.exceptionHandling(exceptionHandling -> exceptionHandling
                .authenticationEntryPoint((request, response, authException) ->
                        writeApiError(
                                response,
                                HttpStatus.UNAUTHORIZED,
                                PANEL_UNAUTHORIZED_CODE,
                                PANEL_UNAUTHORIZED_MESSAGE
                        ))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                        writeApiError(
                                response,
                                HttpStatus.FORBIDDEN,
                                PANEL_FORBIDDEN_CODE,
                                PANEL_FORBIDDEN_MESSAGE
                        ))
        );

        // formLogin для логина по логину/паролю
        http.formLogin(form -> form
                .loginProcessingUrl(PANEL_LOGIN_PATH)
                .usernameParameter(PANEL_LOGIN_PARAMETER)
                .passwordParameter(PANEL_PASSWORD_PARAMETER)
                .successHandler((request, response, authentication) -> response.setStatus(HttpStatus.OK.value()))
                .failureHandler((request, response, exception) -> {
                    writeApiError(
                            response,
                            HttpStatus.UNAUTHORIZED,
                            INVALID_CREDENTIALS_CODE,
                            DEFAULT_AUTH_FAILURE_MESSAGE
                    );
                })
        );

        // logout для сессионных админов
        http.logout(logout -> logout
                .logoutUrl(PANEL_LOGOUT_PATH)
                .logoutSuccessHandler((request, response, authentication) -> response.setStatus(HttpStatus.OK.value()))
        );

        return http.build();
    }

    /**
     * Основная цепочка безопасности для остальных API (приоритет 2).
     */
    @Bean
    @Order(2)
    public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http.securityMatcher(API_PATTERN);

        http.csrf(csrf -> csrf.disable());
        http.cors(Customizer.withDefaults());
        http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.httpBasic(Customizer.withDefaults());
        http.formLogin(Customizer.withDefaults());

        http.authorizeHttpRequests(auth -> auth
                // открыть документацию и health
                .requestMatchers(PUBLIC_DOCUMENTATION_ENDPOINTS).permitAll()
                // ping
                .requestMatchers(HttpMethod.GET, "/api/ping").permitAll()
                // telegram / auth
                .requestMatchers(HttpMethod.POST, PUBLIC_AUTH_ENDPOINTS).permitAll()
                // панель должна отдаваться как статика
                .requestMatchers(HttpMethod.GET, STATIC_PANEL_ENDPOINTS).permitAll()
                // публичное расписание и события
                .requestMatchers(HttpMethod.GET, "/api/training-sessions/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/events/*/join", "/api/events/*/cancel").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/training-sessions/*/join", "/api/training-sessions/*/cancel").authenticated()
                // публичный магазин
                .requestMatchers(HttpMethod.GET, PUBLIC_SHOP_ENDPOINTS).permitAll()
                // прочие публичные данные
                .requestMatchers(HttpMethod.GET, "/api/members/my-students").hasAnyRole(COACH_OR_ADMIN_ROLES)
                .requestMatchers(HttpMethod.POST, "/api/members/*/boxer-potential/measurements").hasAnyRole(COACH_OR_ADMIN_ROLES)
                .requestMatchers(HttpMethod.PUT, "/api/members/*/boxer-potential/measurements/*").hasAnyRole(COACH_OR_ADMIN_ROLES)
                .requestMatchers(HttpMethod.GET, "/api/members/*/boxer-potential/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/members/boxer-potential/leaderboard").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/members").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/members/*").permitAll()

                // доступ к управлению учениками разрешён как тренерам, так и администраторам
                .requestMatchers(HttpMethod.GET, "/api/trainer/students/**").hasAnyRole(COACH_OR_ADMIN_ROLES)
                .requestMatchers(HttpMethod.POST, "/api/trainer/students/**").hasAnyRole(COACH_OR_ADMIN_ROLES)
                .requestMatchers(HttpMethod.DELETE, "/api/trainer/students/**").hasAnyRole(COACH_OR_ADMIN_ROLES)
                .requestMatchers(HttpMethod.PATCH, "/api/trainer/students/**").hasAnyRole(COACH_OR_ADMIN_ROLES)
                .requestMatchers(HttpMethod.GET, "/api/trainer/schedule").hasAnyRole(COACH_OR_ADMIN_ROLES)
                .requestMatchers(HttpMethod.POST, "/api/trainer/personal-trainings").hasAnyRole(COACH_OR_ADMIN_ROLES)
                .requestMatchers(HttpMethod.POST, "/api/trainer/events").hasAnyRole(COACH_OR_ADMIN_ROLES)
                .requestMatchers("/api/schedule2/**").hasAnyRole(COACH_OR_ADMIN_ROLES)
                .requestMatchers(HttpMethod.GET, "/api/verification/incoming").hasAnyRole(COACH_OR_ADMIN_ROLES)
                .requestMatchers(HttpMethod.POST, "/api/verification/*/review").hasAnyRole(COACH_OR_ADMIN_ROLES)

                // админка
                .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                .requestMatchers("/api/account/**").authenticated()
                .requestMatchers("/api/admin/**").hasRole(ROLE_ADMIN)
                .anyRequest().authenticated()
        );

        // фильтр JWT до UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void writeApiError(
            HttpServletResponse response,
            HttpStatus status,
            String code,
            String message
    ) throws IOException {
        response.setStatus(status.value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(apiErrorResponse(code, message, status));
    }

    private String apiErrorResponse(String code, String message, HttpStatus status) {
        return "{\"code\":\"" + escapeJson(code) + "\","
                + "\"message\":\"" + escapeJson(message) + "\","
                + "\"httpStatus\":" + status.value() + "}";
    }

    private String escapeJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }
}
