package com.round13.backend.module.profile.service;

import com.round13.backend.domain.ProfileEntity;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/** Display-only fallbacks must never populate structured profile fields. */
public final class ProfileDisplayName {
    private ProfileDisplayName() {}

    public static String resolve(ProfileEntity profile, String nickname, String visiblePhone) {
        if (profile != null) {
            String name = Stream.of(profile.getSurname(), profile.getFirstName(), profile.getPatronymic())
                    .filter(Objects::nonNull).map(String::trim).filter(value -> !value.isEmpty())
                    .collect(Collectors.joining(" "));
            if (!name.isEmpty()) return name;
            if (hasText(profile.getFullName())) return profile.getFullName().trim();
        }
        if (hasText(nickname)) return nickname.trim();
        return hasText(visiblePhone) ? visiblePhone.trim() : "Без имени";
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
