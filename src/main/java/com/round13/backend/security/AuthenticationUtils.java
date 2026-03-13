package com.round13.backend.security;

import org.springframework.security.core.Authentication;

import java.util.UUID;

public final class AuthenticationUtils {

    private AuthenticationUtils() {
    }

    public static UUID getUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }

    public static UUID getUserIdOrNull(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }

        return UUID.fromString(authentication.getName());
    }
}
