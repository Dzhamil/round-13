package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.profile.service.ProfileDisplayName;

final class SheetPersonMapper {
    private SheetPersonMapper() {}

    static PersonSheetPlan.Person map(UserEntity user, ProfileEntity profile, boolean active) {
        return new PersonSheetPlan.Person(user.getId(),
                ProfileDisplayName.resolve(profile, user.getNickname(), user.getPhone()),
                user.getNickname(), user.getPhone(), active,
                profile == null ? null : profile.getSurname(),
                profile == null ? null : profile.getFirstName(),
                profile == null ? null : profile.getPatronymic());
    }
}
