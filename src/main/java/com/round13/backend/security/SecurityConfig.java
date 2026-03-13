package com.round13.backend.security;

import com.round13.backend.module.adminpanel.service.AdminPanelUserDetailsService;
import com.round13.backend.security.jwt.JwtAuthenticationFilter;
import com.round13.backend.security.jwt.JwtClaimsValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
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
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtService jwtService;
    private final AdminPanelUserDetailsService adminPanelUserDetailsService;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtClaimsValidator jwtClaimsValidator) {
        return new JwtAuthenticationFilter(jwtService, jwtClaimsValidator);
    }

    /**
     * Цепочка безопасности для админ‑панели (приоритет 1).
     */
    @Bean
    @Order(1)
    public SecurityFilterChain adminPanelSecurityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher("/api/panel/**");

        http.csrf(csrf -> csrf.disable());
        http.cors(Customizer.withDefaults());
        http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.ALWAYS));

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/api/panel/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/panel/auth/logout").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/panel/auth/token").permitAll()
                .anyRequest().hasRole("PANEL_ADMIN")
        );

        // подключаем UserDetailsService для администраторов панели
        http.userDetailsService(adminPanelUserDetailsService);

        // formLogin для логина по логину/паролю
        http.formLogin(form -> form
                .loginProcessingUrl("/api/panel/auth/login")
                .usernameParameter("login")
                .passwordParameter("password")
                .successHandler((request, response, authentication) -> response.setStatus(HttpStatus.OK.value()))
                .failureHandler((request, response, exception) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType("application/json");
                    String message = exception.getMessage() == null ? "Неверный логин или пароль" : exception.getMessage();
                    response.getWriter().write("{\"message\":\"" + message + "\"}");
                })
        );

        // logout для сессионных админов
        http.logout(logout -> logout
                .logoutUrl("/api/panel/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> response.setStatus(HttpStatus.OK.value()))
        );

        return http.build();
    }

    /**
     * Основная цепочка безопасности для остальных API (приоритет 2).
     */
    @Bean
    @Order(2)
    public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter, JwtClaimsValidator jwtClaimsValidator) throws Exception {
        http.securityMatcher("/**");

        http.csrf(csrf -> csrf.disable());
        http.cors(Customizer.withDefaults());
        http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.httpBasic(Customizer.withDefaults());
        http.formLogin(Customizer.withDefaults());

        http.authorizeHttpRequests(auth -> auth
                // открыть документацию и health
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/actuator/**").permitAll()
                // ping
                .requestMatchers(HttpMethod.GET, "/api/ping").permitAll()
                // telegram / auth
                .requestMatchers(HttpMethod.POST, "/api/auth/telegram-login", "/api/auth/refresh").permitAll()
                // панель должна отдаваться как статика
                .requestMatchers(HttpMethod.GET, "/admin/**", "/panel/**").permitAll()
                // публичное расписание
                .requestMatchers(HttpMethod.GET, "/api/training-sessions/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/training-sessions/*/join", "/api/training-sessions/*/cancel").authenticated()
                // публичный магазин
                .requestMatchers(HttpMethod.GET, "/api/shop/categories/**", "/api/shop/products/**").permitAll()
                // прочие публичные данные
                .requestMatchers(HttpMethod.GET, "/api/members/my-students").hasAnyRole("COACH", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/members").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/members/*").permitAll()

                // доступ к управлению учениками разрешён как тренерам, так и администраторам
                .requestMatchers(HttpMethod.POST, "/api/trainer/students/**").hasAnyRole("COACH", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/trainer/students/**").hasAnyRole("COACH", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/trainer/students/**").hasAnyRole("COACH", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/trainer/schedule").hasAnyRole("COACH", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/trainer/personal-trainings").hasAnyRole("COACH", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/trainer/events").hasAnyRole("COACH", "ADMIN")

                // админка
                .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                .requestMatchers("/api/account/**").authenticated()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
        );

        // фильтр JWT до UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
