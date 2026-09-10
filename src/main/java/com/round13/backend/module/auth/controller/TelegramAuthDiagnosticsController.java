package com.round13.backend.module.auth.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Public, strictly bounded metadata only. Never accepts login credentials. */
@RestController
@Slf4j
public class TelegramAuthDiagnosticsController {
    // Bound anonymous diagnostic log volume per backend instance without storing client identifiers.
    private long windowStarted = System.nanoTime();
    private int eventsInWindow;

    private synchronized boolean allowEvent() {
        long now = System.nanoTime();
        if (now - windowStarted >= 60_000_000_000L) {
            windowStarted = now;
            eventsInWindow = 0;
        }
        return eventsInWindow++ < 120;
    }

    @ExceptionHandler({org.springframework.http.converter.HttpMessageNotReadableException.class,
            org.springframework.web.bind.MethodArgumentNotValidException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public void invalidDiagnostic() {
        // Never send parser exceptions containing untrusted payloads to the global error journal.
    }

    public record Diagnostic(
            @NotNull @Pattern(regexp = "missing_init_data|init_data_timeout|transient_failure|permanent_auth_failure|aborted|success") String category,
            @NotNull Boolean hasInitData,
            @NotNull @Min(0) @Max(100000) Integer initDataLength,
            @NotNull @Pattern(regexp = "ios|android|tdesktop|macos|web|weba|webk|unigram|unknown") String platform,
            @NotNull @Pattern(regexp = "[0-9]{1,3}\\.[0-9]{1,3}|unknown") String webAppVersion,
            @NotNull @Pattern(regexp = "/auth") String route,
            @NotNull @Pattern(regexp = "[a-f0-9]{7,40}|build-[0-9]{13}") String release,
            @NotNull @Min(0) @Max(300000) Integer elapsedMs,
            @NotNull @Min(0) @Max(3) Integer attemptCount
    ) {}

    @PostMapping("/api/auth/telegram-diagnostics")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void record(@Valid @RequestBody Diagnostic event) {
        if (!allowEvent()) return;
        log.info("Telegram auth client diagnostic category={} hasInitData={} initDataLength={} platform={} webAppVersion={} route={} release={} elapsedMs={} attemptCount={}",
                event.category(), event.hasInitData(), event.initDataLength(), event.platform(),
                event.webAppVersion(), event.route(), event.release(), event.elapsedMs(), event.attemptCount());
    }
}
