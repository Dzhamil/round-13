// src/main/java/com/round13/backend/module/profile/service/ProfileServiceUtil.java
package com.round13.backend.module.profile.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;

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
        profile.setFullName(trimToNull(profile.getFullName()));
        profile.setAvatarUrl(trimToNull(profile.getAvatarUrl()));
        profile.setClan(trimToNull(profile.getClan()));
        profile.setGender(trimToNull(profile.getGender()));
    }

    public void normalize(UserEntity user) {
        user.setNickname(trimToNull(user.getNickname()));
        user.setPhone(normalizePhone(user.getPhone()));
    }

    /**
     * Новые правила completed:
     * nickname + phone (User) + gender + avatarUrl (Profile)
     * birthDate НЕ обязательна.
     */
    public boolean isCompleted(ProfileEntity profile, UserEntity user) {
        return StringUtils.hasText(user.getNickname())
                && StringUtils.hasText(user.getPhone())
                && StringUtils.hasText(profile.getGender())
                && StringUtils.hasText(profile.getAvatarUrl());
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
