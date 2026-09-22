package com.round13.backend.module.sheets.service;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static org.assertj.core.api.Assertions.*;

class TrainerSheetReferenceTest {
    @ParameterizedTest
    @ValueSource(strings = {"https://docs.google.com/spreadsheets/d/book/edit#gid=0",
            "https://docs.google.com/spreadsheets/d/book/edit?gid=0",
            "https://docs.google.com/spreadsheets/d/book/edit?usp=sharing#gid=0&range=A1"})
    void acceptsCurrentSpreadsheetLinksIncludingZeroGid(String link) {
        assertThat(TrainerSheetReference.sheetId(link, "book")).hasValue(0);
    }

    @ParameterizedTest
    @ValueSource(strings = {"Coach's sheet", "Тренер", "gid=123", "123"})
    void keepsLiteralTabNames(String title) {
        assertThat(TrainerSheetReference.sheetId(title, "book")).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"https://docs.google.com/spreadsheets/d/other/edit#gid=1",
            "https://example.com/spreadsheets/d/book/edit#gid=1",
            "https://docs.google.com/spreadsheets/d/book/edit",
            "https://docs.google.com/spreadsheets/d/book/edit#gid=abc",
            "https://docs.google.com/spreadsheets/d/book/edit#gid=-1",
            "https://docs.google.com/spreadsheets/d/book/edit#gid=99999999999999999",
            "https://docs.google.com/spreadsheets/d/book/edit#gid=1oops",
            "https://invalid link"})
    void rejectsInvalidLinksRatherThanReadingThemAsTitles(String link) {
        assertThatThrownBy(() -> TrainerSheetReference.sheetId(link, "book"))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("Личный лист");
    }
}
