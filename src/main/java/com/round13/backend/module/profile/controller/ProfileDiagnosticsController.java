package com.round13.backend.module.profile.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/account/profile/diagnostics")
@Slf4j
public class ProfileDiagnosticsController {
    public enum Reason {
        missing_surname, missing_first_name, missing_patronymic, missing_phone, invalid_phone,
        missing_birth_date, invalid_birth_date, missing_gender, missing_nickname, missing_avatar
    }
    public record BlockedSubmit(@NotNull Reason reason) {}

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void blocked(Authentication authentication, @Valid @RequestBody BlockedSubmit event) {
        log.warn("profile_submit_blocked user_id={} reason={}",
                UUID.fromString(authentication.getName()), event.reason());
    }
}
