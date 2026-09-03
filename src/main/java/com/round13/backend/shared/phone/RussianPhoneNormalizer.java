package com.round13.backend.shared.phone;

import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class RussianPhoneNormalizer {

    private static final int LOCAL_LENGTH = 10;
    private static final int FULL_LENGTH = 11;

    public Optional<String> normalize(String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }

        String digits = value.replaceAll("\\D", "");
        if (digits.length() == LOCAL_LENGTH && digits.startsWith("9")) {
            digits = "7" + digits;
        } else if (digits.length() == FULL_LENGTH && digits.startsWith("8")) {
            digits = "7" + digits.substring(1);
        }

        if (digits.length() != FULL_LENGTH || !digits.startsWith("7")) {
            return Optional.empty();
        }
        return Optional.of("+" + digits);
    }
}
