package com.round13.backend.module.sheets.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import java.util.List;
import static org.assertj.core.api.Assertions.*;

class TrainerSheetSyncFlagTest {
    @ParameterizedTest @CsvSource({"TRUE,true", "Да,true", "1,true", "FALSE,false", "Нет,false", "0,false", "' ',false"})
    void readsControlBeforeCatalogue(String value, boolean expected) {
        assertThat(TrainerSheetSyncFlag.enabled("Sheet", List.of(List.of("", "Синхронизация", value)))).isEqualTo(expected);
    }
    @Test void ignoresContentAndFailsClosedOnMissingAmbiguousOrMalformedControl() {
        assertThat(TrainerSheetSyncFlag.enabled("Sheet", List.of())).isFalse();
        assertThat(TrainerSheetSyncFlag.enabled("Sheet", List.of(List.of("ID тренировки"), List.of("Синхронизация", "TRUE")))).isFalse();
        assertThatThrownBy(() -> TrainerSheetSyncFlag.enabled("Sheet", List.of(List.of("Синхронизация", "maybe"))))
                .hasMessageContaining("Sheet").hasMessageContaining("строка 1");
        assertThatThrownBy(() -> TrainerSheetSyncFlag.enabled("Sheet", List.of(List.of("Синхронизация", "TRUE"), List.of("Синхронизация", "FALSE"))))
                .hasMessageContaining("Повторный");
    }
}
