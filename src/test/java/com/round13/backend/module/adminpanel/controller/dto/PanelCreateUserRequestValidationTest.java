package com.round13.backend.module.adminpanel.controller.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PanelCreateUserRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

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
