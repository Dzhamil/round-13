package com.round13.backend.module.profile.service;

import com.round13.backend.domain.ProfileEntity;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class ProfileDisplayNameTest {
    @Test
    void explicitPartsPrecedeLegacyNameNicknameAndVisiblePhoneWithoutMutatingProfile() {
        var profile = new ProfileEntity();
        assertThat(ProfileDisplayName.resolve(profile, null, "phone")).isEqualTo("phone");
        assertThat(ProfileDisplayName.resolve(profile, " nick ", "phone")).isEqualTo("nick");
        profile.setFullName(" Legacy ");
        assertThat(ProfileDisplayName.resolve(profile, "nick", "phone")).isEqualTo("Legacy");
        assertThat(profile.getSurname()).isNull();
        assertThat(profile.getFirstName()).isNull();
        assertThat(profile.getPatronymic()).isNull();
        profile.setFirstName(" First "); profile.setSurname(" Surname "); profile.setPatronymic(" Patronymic ");
        assertThat(ProfileDisplayName.resolve(profile, "nick", "phone")).isEqualTo("Surname First Patronymic");
        assertThat(ProfileDisplayName.resolve(null, null, null)).isEqualTo("Без имени");
    }
}
