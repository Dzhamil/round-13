package com.round13.backend.module.profile.service;

import com.round13.backend.support.ProfileIdentityFixture;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.ProfileEntity;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ProfileServiceUtilTest {

    private final ProfileServiceUtil util = new ProfileServiceUtil();

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\t\n"})
    void allNamePartsAreRequiredEvenWithLegacyName(String missing) {
        UserEntity user = new UserEntity();
        user.setNickname("boxer");
        user.setPhone("+79991234567");
        ProfileEntity profile = new ProfileEntity();
        profile.setGender("MALE");
        profile.setBirthDate(java.time.LocalDate.of(2000, 1, 1));
        profile.setAvatarUrl("avatar.jpg");
        profile.setFullName("Legacy Name");
        profile.setSurname(ProfileIdentityFixture.SURNAME);
        profile.setFirstName(ProfileIdentityFixture.FIRST_NAME);
        profile.setPatronymic(ProfileIdentityFixture.PATRONYMIC);
        assertThat(util.isCompleted(profile, user)).isTrue();
        profile.setSurname(missing);
        assertThat(util.isCompleted(profile, user)).isFalse();
        profile.setSurname(ProfileIdentityFixture.SURNAME);
        profile.setFirstName(missing);
        assertThat(util.isCompleted(profile, user)).isFalse();
        profile.setFirstName(ProfileIdentityFixture.FIRST_NAME);
        profile.setPatronymic(missing);
        assertThat(util.isCompleted(profile, user)).isFalse();
    }

    @Test
    void validatesEveryMandatoryFieldIncludingInvalidLegacyData() {
        var user = new UserEntity();
        var profile = new ProfileEntity();
        user.setNickname("fallback nickname");
        profile.setFullName("Legacy Full Name");
        profile.setBirthDate(java.time.LocalDate.now().plusDays(1));
        profile.setGender("invalid");
        user.setPhone("invalid");
        assertThat(util.missingFields(profile, user)).containsExactly(
                "surname", "firstName", "patronymic", "phone");
        profile.setSurname("Surname"); profile.setFirstName("First"); profile.setPatronymic("Patronymic");
        user.setPhone("+79991234567"); profile.setGender("OTHER");
        profile.setBirthDate(java.time.LocalDate.now().minusYears(20)); profile.setAvatarUrl("avatar.jpg");
        assertThat(util.isCompleted(profile, user)).isTrue();
        user.setNickname(" ");
        assertThat(util.missingFields(profile, user)).isEmpty();
        user.setNickname("nick"); profile.setAvatarUrl(" ");
        assertThat(util.missingFields(profile, user)).isEmpty();
    }

    @Test
    void normalizePhoneValueAcceptsSupportedRussianInputs() {
        assertThat(util.normalizePhoneValue("89991234567")).isEqualTo("+79991234567");
        assertThat(util.normalizePhoneValue("79991234567")).isEqualTo("+79991234567");
        assertThat(util.normalizePhoneValue("9991234567")).isEqualTo("+79991234567");
        assertThat(util.normalizePhoneValue("+79991234567")).isEqualTo("+79991234567");
        assertThat(util.normalizePhoneValue("+7 (999) 123-45-67")).isEqualTo("+79991234567");
    }

    @Test
    void normalizeUserKeepsPhoneHiddenIndependentFromPhoneValue() {
        UserEntity user = new UserEntity();
        user.setPhone("+7 (999) 123-45-67");
        user.setPhoneHidden(true);

        util.normalize(user);

        assertThat(user.getPhone()).isEqualTo("+79991234567");
        assertThat(user.isPhoneHidden()).isTrue();
    }
}
