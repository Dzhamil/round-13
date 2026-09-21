package com.round13.backend.module.sheets.integration;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ParticipantSheetSchemaTest {
    @Test
    void pinsPersistedColumnsAndRanges() {
        assertThat(ParticipantSheetSchema.HEADERS).containsExactly("Фамилия", "Имя", "Отчество", "Ник", "Телефон",
                "Активен", "Тренер", "user_id", "trainer_user_id", "Статус синхронизации", "Время синхронизации");
        var columns = ParticipantSheetSchema.Column.values();
        for (int i = 0; i < columns.length; i++) {
            assertThat(columns[i].index()).isEqualTo(i);
            assertThat(columns[i].a1()).isEqualTo(String.valueOf((char) ('A' + i)));
            assertThat(ParticipantSheetSchema.HEADERS.get(i)).isEqualTo(columns[i].header());
        }
        assertThat(ParticipantSheetSchema.previousSnapshotRange()).isEqualTo("'Участники'!A:ZZ");
        assertThat(ParticipantSheetSchema.trainerFormulaOrigin()).isEqualTo("'Участники'!I2");
    }

    @Test
    void usesExactMatchLookupAndValidEmptyDropdownRange() {
        assertThat(ParticipantSheetSchema.trainerLookupFormula(2, "ru_RU"))
                .isEqualTo("=IF(G2=\"\";\"\";XLOOKUP(G2;'Справочник тренеров'!A2:A;'Справочник тренеров'!B2:B;\"\";0))");
        assertThat(ParticipantSheetSchema.trainerLookupFormula(123, "en_US"))
                .isEqualTo("=IF(G123=\"\",\"\",XLOOKUP(G123,'Справочник тренеров'!A2:A,'Справочник тренеров'!B2:B,\"\",0))");
        assertThat(ParticipantSheetSchema.trainerLookupFormula(2, "de-DE"))
                .isEqualTo(ParticipantSheetSchema.trainerLookupFormula(2, "ru_RU"));
        assertThat(ParticipantSheetSchema.trainerDropdownSource(1)).isEqualTo("='Справочник тренеров'!$A$2:$A2");
        assertThat(ParticipantSheetSchema.trainerDropdownSource(8)).isEqualTo("='Справочник тренеров'!$A$2:$A8");
    }

    @Test
    void quotesTabNamesWithoutUrlEncodingA1Notation() {
        assertThat(SheetRanges.origin("Coach's sheet")).isEqualTo("'Coach''s sheet'!A1");
        assertThat(SheetRanges.exportColumns("Тренеры")).isEqualTo("'Тренеры'!A:Z");
    }
}
