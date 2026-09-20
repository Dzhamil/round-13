package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.profile.service.ProfileDisplayName;
import com.round13.backend.module.profile.service.ProfileServiceUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AllUsersSheetMapper {
    private final ProfileServiceUtil profileRules;

    public List<Object> map(UserEntity user, ProfileEntity profile, String trainers, String syncedAt) {
        String role = user.getRole().getCode();
        return List.of(text(profile == null ? null : profile.getSurname()),
                text(profile == null ? null : profile.getFirstName()),
                text(profile == null ? null : profile.getPatronymic()),
                ProfileDisplayName.resolve(profile, user.getNickname(), user.getPhone()),
                text(user.getNickname()), text(user.getPhone()), role, yes(user.isTrainer()),
                yes("ADMIN".equals(role)), user.getStatus().name(),
                profile != null && profileRules.isCompleted(profile, user) ? "Заполнен" : "Требуется верификация",
                user.getTelegramUserId() == null ? "" : user.getTelegramUserId().toString(),
                trainers, "Синхронизирован", syncedAt);
    }

    private static String text(String value) { return value == null ? "" : value.trim(); }
    private static String yes(boolean value) { return value ? "Да" : "Нет"; }
}
