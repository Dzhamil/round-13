// src/main/java/com/round13/backend/module/profile/service/ProfileServiceUtil.java
package com.round13.backend.module.profile.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProfileServiceUtil {

    private final RussianPhoneNormalizer phoneNormalizer;

    public ProfileServiceUtil() {
        this(new RussianPhoneNormalizer());
    }

    @Autowired
    public ProfileServiceUtil(RussianPhoneNormalizer phoneNormalizer) {
        this.phoneNormalizer = phoneNormalizer;
    }

    public void normalize(ProfileEntity profile) {
        profile.setSurname(trimToNull(profile.getSurname()));
        profile.setFirstName(trimToNull(profile.getFirstName()));
        profile.setPatronymic(trimToNull(profile.getPatronymic()));
        profile.setFullName(trimToNull(profile.getFullName()));
        profile.setAvatarUrl(trimToNull(profile.getAvatarUrl()));
        profile.setClan(trimToNull(profile.getClan()));
        profile.setGender(trimToNull(profile.getGender()));
    }

    public void normalize(UserEntity user) {
        user.setNickname(trimToNull(user.getNickname()));
        user.setPhone(normalizePhone(user.getPhone()));
    }

    /** Profile verification is independent of staff phone/student verification. */
    public boolean isCompleted(ProfileEntity profile, UserEntity user) {
        return missingFields(profile, user).isEmpty();
    }

    public List<String> missingFields(ProfileEntity profile, UserEntity user) {
        var missing = new ArrayList<String>();
        if (!StringUtils.hasText(profile.getSurname())) missing.add("surname");
        if (!StringUtils.hasText(profile.getFirstName())) missing.add("firstName");
        if (!StringUtils.hasText(profile.getPatronymic())) missing.add("patronymic");
        if (normalizePhone(user.getPhone()) == null) missing.add("phone");
        return List.copyOf(missing);
    }

    /**
     * Публичный хелпер для trimToNull.
     * Нужен, чтобы сервисы делали сравнения/проверки уникальности по тем же правилам, что и normalize().
     */
    public String trimToNullValue(String value) {
        return trimToNull(value);
    }

    /**
     * Публичный хелпер для нормализации телефона.
     * Нужен, чтобы проверки уникальности делались по нормализованному значению (до сохранения).
     */
    public String normalizePhoneValue(String value) {
        return normalizePhone(value);
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String normalizePhone(String value) {
        return phoneNormalizer.normalize(value).orElse(null);
    }

}
