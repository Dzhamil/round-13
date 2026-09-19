package com.round13.backend.module.adminpanel.controller.dto;

import com.round13.backend.support.ProfileIdentityFixture;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PanelCreateUserRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.NullAndEmptySource
    @org.junit.jupiter.params.provider.ValueSource(strings = {" ", "\t\n"})
    void rejectsMissingNameParts(String missing) {
        for (int index = 0; index < 3; index++) {
            String[] parts = ProfileIdentityFixture.nameParts();
            parts[index] = missing;
            var request = new PanelCreateUserRequest(parts[0], parts[1], parts[2],
                    "+79991234567", "boxer", null, true, "ATHLETE");
            assertThat(validator.validate(request)).isNotEmpty();
        }
    }

    @Test
    void generatedPasswordDoesNotRequireManualPassword() {
        var request = request(null, true);

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void manualPasswordMustHaveAtLeastEightCharacters() {
        var request = request("short", false);

        assertThat(validator.validate(request))
                .extracting(violation -> violation.getMessage())
                .contains("Пароль должен содержать от 8 до 72 символов");
    }

    private PanelCreateUserRequest request(String password, boolean generatePassword) {
        return new PanelCreateUserRequest(
                "Лёнин", "Владимир", "Олегович", "89600563067", "musakas",
                password, generatePassword, "COACH"
        );
    }
}
