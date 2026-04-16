package com.round13.backend.security;

import org.springframework.security.core.Authentication;

import java.util.Objects;
import java.util.UUID;

public final class AuthenticationUtils {

    private AuthenticationUtils() {
    }

    public static UUID getUserId(Authentication authentication) {
        Objects.requireNonNull(authentication, "authentication must not be null");
        return resolveUserId(authentication);
    }

    public static UUID getUserIdOrNull(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        try {
            return resolveUserId(authentication);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static UUID resolveUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof UUID userId) {
            return userId;
        }

        String name = authentication.getName();
        if (name == null) {
            throw new IllegalArgumentException("Authentication name must contain user id");
        }

        return UUID.fromString(name);
    }
}
