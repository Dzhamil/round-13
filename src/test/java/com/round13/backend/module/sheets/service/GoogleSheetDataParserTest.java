package com.round13.backend.module.sheets.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GoogleSheetDataParserTest {
    private final GoogleSheetDataParser parser = new GoogleSheetDataParser();

    @Test
    void mapsVerificationForRussianTrainerAndParticipantRows() {
        var rows = parser.people(List.of(
                List.of("ФИО", "Телефон", "Прошел верификацию", "Лист расписания"),
                List.of("Dzhamill", "+7 (939) 393-09-20", "Да", "Dzhamill"),
                List.of("Test", "+7 999 000-11-22", "Нет", "")));

        assertThat(rows).extracting(GoogleSheetDataParser.PersonRow::verified).containsExactly(true, false);
        assertThat(rows.getFirst().scheduleSheet()).isEqualTo("Dzhamill");
    }

}
