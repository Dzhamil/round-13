package com.round13.backend.module.profile.service;

import com.round13.backend.domain.UserEntity;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ProfileServiceUtilTest {

    private final ProfileServiceUtil util = new ProfileServiceUtil();

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
