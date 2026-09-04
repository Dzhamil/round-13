package com.round13.backend.shared.phone;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

class RussianPhoneNormalizerTest {

    private final RussianPhoneNormalizer normalizer = new RussianPhoneNormalizer();

    @ParameterizedTest
    @ValueSource(strings = {
            "+79393930920",
            "79393930920",
            "89393930920",
            "8 (939) 393-09-20",
            "+7 (939) 393-09-20"
    })
    void normalizesEquivalentRussianPhoneFormats(String input) {
        assertThat(normalizer.normalize(input)).contains("+79393930920");
    }
}
