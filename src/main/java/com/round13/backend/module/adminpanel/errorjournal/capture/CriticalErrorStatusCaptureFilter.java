package com.round13.backend.module.adminpanel.errorjournal.capture;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
@RequiredArgsConstructor
public class CriticalErrorStatusCaptureFilter extends OncePerRequestFilter {

    private final CriticalErrorCaptureService captureService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        filterChain.doFilter(request, response);

        if (response.getStatus() >= 500 && request.getAttribute(CriticalErrorCaptureService.CAPTURED_REQUEST_ATTRIBUTE) == null) {
            captureService.captureBackendStatus(request, response.getStatus());
        }
    }
}
