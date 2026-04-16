package com.round13.backend.security;

import com.round13.backend.module.adminpanel.service.AdminPanelUserDetailsService;
import com.round13.backend.security.jwt.JwtAuthenticationFilter;
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
    private static final String[] PUBLIC_AUTH_ENDPOINTS = {"/api/auth/telegram-login", "/api/auth/refresh"};
    private static final String[] PUBLIC_SHOP_ENDPOINTS = {"/api/shop/categories/**", "/api/shop/products/**"};

    private static final String API_PATTERN = "/**";
    private static final String PANEL_API_PATTERN = "/api/panel/**";
    private static final String PANEL_LOGIN_PATH = "/api/panel/auth/login";
    private static final String PANEL_LOGOUT_PATH = "/api/panel/auth/logout";
    private static final String PANEL_TOKEN_PATH = "/api/panel/auth/token";
    private static final String PANEL_LOGIN_PARAMETER = "login";
    private static final String PANEL_PASSWORD_PARAMETER = "password";
    private static final String DEFAULT_AUTH_FAILURE_MESSAGE = "Неверный логин или пароль";

    private final JwtService jwtService;
    private final AdminPanelUserDetailsService adminPanelUserDetailsService;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtService);
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

        // formLogin для логина по логину/паролю
        http.formLogin(form -> form
                .loginProcessingUrl(PANEL_LOGIN_PATH)
                .usernameParameter(PANEL_LOGIN_PARAMETER)
                .passwordParameter(PANEL_PASSWORD_PARAMETER)
                .successHandler((request, response, authentication) -> response.setStatus(HttpStatus.OK.value()))
                .failureHandler((request, response, exception) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write(authFailureResponse(exception.getMessage()));
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

    private String authFailureResponse(String message) {
        String resolvedMessage = message == null ? DEFAULT_AUTH_FAILURE_MESSAGE : message;
        return "{\"message\":\"" + escapeJson(resolvedMessage) + "\"}";
    }

    private String escapeJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }
}
